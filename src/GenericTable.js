import React from 'react';
import MUIDataTable from 'mui-datatables';
import CustomTooltip from './decoration/CustomTooltip';
import { withRouter } from 'react-router-dom';
import { timer, from, Subject } from 'rxjs';
import { debounce, map, switchMap } from 'rxjs/operators';
import PropTypes from 'prop-types';
import Util from './Util';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import './GenericTable.scss';
import { clone } from 'ramda';

const CustomTooltipForDatatables = props => {
  if(typeof props.title !== 'string' || props.title.trim() === '') return props.children;
  return <CustomTooltip placement='bottom' text={props.title}>{props.children}</CustomTooltip>;
};

// Note about page numbering:
//
// Page number starts from 1 in the backend, but from
// 0 in this table library. But in order to make the URL
// query params the same (i.e. first page is p=1 and second is p=2, etc)
// it increases/decreases the value when storing/retrieving query params.
// This way, frontend URLs are consistent with the backend, even though internally
// it's using 0-based page numbers.

// How to test (TODO: write automatic tests):
//
// Testing the page ('p') query param:
// 1. When refreshing the page several times, the 'p' query param doesn't change everytime.
// 2. First page is p=1, second is p=2, etc. It's NOT a 0-based index.
// 3. Page p=1 gets hidden from the query string.
// 4. When p=1 (in other words, when it's not in the query string), left-arrow (previous page button) shouldn't be clickable.
// 5. Content of first page matches the data that should come from server. Also the same for other pages.
// 6. Status of table is the same when the browser is refreshed.
// 7. When changing the keyword, page query param ('p') disappears. This is because keyword changes create new filters,
//    making the page start again at 1 because the data could have different amount of rows.
// 8. When changing pages, pages or data are not skipped.

const ROWS_PER_PAGE_OPTIONS = [10, 50, 100];
const DEFAULT_VALUES = {
  p: 0,
  perPage: ROWS_PER_PAGE_OPTIONS[0],
  sortOrder: '',
  sortOrderDirection: '',
  keyword: ''
};
const QUERY_PARAMS_TO_DATATABLES_MAP = {
  p: 'page',
  perPage: 'rowsPerPage',
  keyword: 'searchText'
};

const KEYWORD_CHANGE_DELAY_TIME = 200;
// Note that to avoid DB operations when pressing too many
// buttons (e.g. page change buttons), this could also be set to some time higher like 100, or so.
const BUTTON_DELAY_TIME = 100;

class GenericTable extends React.Component{
  constructor(){
    super();

    let fixedTableOpts = {
      filter: false,
      search: false,
      viewColumns: false,
      responsive: 'vertical',
      download: false,
      print: false,
      serverSide: true,
      rowsPerPage: DEFAULT_VALUES.perPage,
      customToolbarSelect: () => <IconButton onClick={this.clearRowSelections}><CancelIcon/></IconButton>,
      rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
      onTableChange: this.onTableChange,
      onRowSelectionChange: this.onRowSelectionChange,
      onSearchClose: () => {
        // This is necessary for when props.queryParams is false.
        // In that case, when the user closes the search box, no search will be performed.
        // It's necessary to emit the search query manually.
        // If the table does have props.queryParams = true, two will be emitted, but
        // since there's a delay, only one DB query will actually happen.
        this.emitter.next(['instant', this.state.tableOpts]);
      }
    };

    let variableTableOpts = {
      page: DEFAULT_VALUES.p,
      count: 0,
      sortOrder: {
        name: DEFAULT_VALUES.sortOrder,
        direction: DEFAULT_VALUES.sortOrderDirection
      }
    };

    this.state = {
      headerLabels: [],
      columns: [],
      data: [],
      tableOpts: Object.assign(fixedTableOpts, variableTableOpts)
    };

    this.emitter = null;

    // Gets changes everytime the user changes a table filter param or presses a button.
    // Some user events might be cancelled or delayed.
    this.tableParams$ = null;

    // Gets params everytime a search (fetch) must be performed.
    this.tableFetch$ = null;
  }

  componentWillUnmount(){
    this.tableParams$.unsubscribe();
    this.tableFetch$.unsubscribe();
  }

  componentDidMount(){
    this.initializeTableChangesHandler();
    this.emitter.next(['instant', this.state.tableOpts]);
  }

  // A bit hacky.
  clearRowSelections = () => {
    this.setState({ rowsSelected: [] });
    if(typeof this.props.onRowSelectionChange === 'function'){
      this.props.onRowSelectionChange([]);
    }
  }

  onTableChange = (action, tableState) => {
    if(action === 'changePage' || action === 'sort' || action === 'changeRowsPerPage'){
      this.emitter.next(['instant', tableState]);
    } else if(action === 'search'){
      let prevKeyword = this.state.tableOpts.searchText || '';
      let nextKeyword = tableState.searchText || '';
      if(prevKeyword !== nextKeyword){
        this.emitter.next(['keyword', tableState]);
      }
    } else {
      console.warn('Unhandled table operation:', action);
    }
  }

  onRowSelectionChange = (_, __, rowsSelected, x) => {
    if(typeof this.props.onRowSelectionChange !== 'function'){
      return;
    }
    // For some reason it's necessary to pass rowsSelected as props to the Table
    // (they are passed from state to props in getDerivedStateFromProps)
    this.setState({ rowsSelected });
    this.props.onRowSelectionChange(rowsSelected);
  }

  // Creates the emitter that can be used to emit table changes.
  // This will handle and perform:
  // 1. Updating the URL query params.
  // 2. Execute the actual query.
  initializeTableChangesHandler = () => {
    this.emitter = new Subject();

    this.tableParams$ = this.emitter.pipe(
      debounce(ev => ev[0] === 'keyword' ? timer(KEYWORD_CHANGE_DELAY_TIME) : timer(BUTTON_DELAY_TIME)),
      map(v => v[1])
    );

    this.tableFetch$ = from(this.tableParams$)
    .pipe(
      switchMap(opts => {
        opts = Object.assign({}, opts, { page: opts.page + 1 });
        return this.props.fetchData(opts);
      })
    );

    // When the data changes, clear row selections.
    this.tableParams$.subscribe(this.clearRowSelections);
    this.tableParams$.subscribe(this.updateQueryParams.bind(this));
    this.tableFetch$.subscribe(this.props.dataFetchedHandler);
  }

  updateQueryParams(tableState){
    if(!this.props.queryParams){
      return;
    }

    let opts = {
      p: tableState.page + 1,
      perPage: tableState.rowsPerPage,
      sortOrder: tableState.sortOrder.name,
      sortOrderDirection: tableState.sortOrder.direction,
      keyword: tableState.searchText
    };

    // Remove the ones that are the same as default values.

    Object.keys(DEFAULT_VALUES).forEach(k => {
      if(k === 'p'){
        if(opts['p'] === 1) delete opts.p;
      } else if(opts[k] === DEFAULT_VALUES[k] || typeof opts[k] === 'undefined' || opts[k] === null){
        delete opts[k];
      }
    });

    this.props.history.push({
      search: '?' + new URLSearchParams(opts).toString()
    });
  }

  static queryParamsToTableOpts(queryParams){
    let ret = {}
    // Get each param from the query string, and then map it to
    // the key names that Datatables uses (e.g. p -> page)
    // and assign the value, or get the default value for that param
    // if it's not in the query string.
    Object.keys(DEFAULT_VALUES).forEach(k => {
      let dataTablesKey = QUERY_PARAMS_TO_DATATABLES_MAP.hasOwnProperty(k) ? QUERY_PARAMS_TO_DATATABLES_MAP[k] : k;

      if(dataTablesKey === 'page'){
        let page = queryParams.get(k);
        ret[dataTablesKey] = page === null ? DEFAULT_VALUES[k] : page - 1;
      } else {
        ret[dataTablesKey] = queryParams.get(k) || DEFAULT_VALUES[k];
      }

      // If it's a string with only digits, convert to number. Except keyword, which has to be always a String.
      // Note that a keyword of only digits gets converted to Number, and if it's too long, to scientific notation,
      // so that must be avoided.
      // TODO: Are there any other string values?
      if(typeof ret[dataTablesKey] === 'string' && ret[dataTablesKey].match(/^[0-9]+$/) && k !== 'keyword'){
        ret[dataTablesKey] = +ret[dataTablesKey];
      }
    });

    // Rearrange a few keys.
    ret.sortOrder = {
      name: ret.sortOrder,
      direction: ret.sortOrderDirection
    };

    return ret;
  }

  static getDerivedStateFromProps(props, state){
    // TODO: Should I actually prevent it from updating state from props?
    // What if count and/or rows (data) change? How is it updating it? (Currently, it works no problem, but
    // with this, it's strange it works). Perhaps I don't understand now and needs more research.
    if(props.projectId){
      return {};
    }

    let tableOpts = state.tableOpts;

    if(props.queryParams){
      let queryParams = new URLSearchParams(props.location.search);
      Object.assign(tableOpts, GenericTable.queryParamsToTableOpts(queryParams));
    }

    tableOpts.count = props.totalCount;
    tableOpts.selectableRows = props.rowsSelectable ? 'multiple' : 'none';
    tableOpts.search = props.search || false;

    let rows = [];
    let columns = [];

    if(typeof props.data !== 'undefined'){
      rows = props.data;
    }

    if(typeof props.columns !== 'undefined'){
      columns = props.columns;
    }

    // Otherwise the rows aren't selected.
    // Read 'this.onRowSelectionChange' method.
    tableOpts.rowsSelected = state.rowsSelected;
    tableOpts.sortOrder.direction = tableOpts.sortOrder.direction || props.defaultSortDirection;

    return {
      tableOpts,
      projectId: props.projectId,
      data: rows.map(row => GenericTable.decorate(row, props.columnDecorators)),
      columns: GenericTable.columnsWithLabel(columns, props.headerLabels, props.headerTooltips)
    };
  }

  static decorate = (row, columnDecorators = {}) => {
    // Use a clone, if the original is modified, there will be cases
    // where the decorator is applied several times like f(f(f(x))) and it's difficult
    // to manage.
    let rowClone = clone(row);
    Object.keys(rowClone).forEach(column => {
      let value = rowClone[column];
      // TODO: This logic might need to be fixed.
      if(typeof columnDecorators === 'object' && columnDecorators.hasOwnProperty(column)){
        value = columnDecorators[column](value, row); // Send the original row (undecorated).
      }
      value = Util.dateDecorator(value);
      value = Util.emptyDecorator(value);
      value = Util.booleanDecorator(value);

      rowClone[column] = value;
    });
    return rowClone;
  }

  static columnsWithLabel(columns, headerLabels, headerTooltips){
    return Object.keys(columns).map(col => {
      let options = {};
      options.sort = columns[col].sort;

      if(headerTooltips !== null && typeof headerTooltips === 'object' && headerTooltips.hasOwnProperty(col)){
        options.hint = headerTooltips[col];
      }

      return {
        name: col,
        label: (headerLabels && headerLabels.hasOwnProperty(col)) ? headerLabels[col] : Util.prettyCase(col),
        options
      };
    });
  }

  render(){
    return(
      <div>
        <MUIDataTable
          columns={this.state.columns}
          data={this.state.data}
          options={this.state.tableOpts}
          components={{ Tooltip: CustomTooltipForDatatables }}
        />
      </div>
    );
  }
}


GenericTable.propTypes = {
  headerLabels: PropTypes.object,
  columns: PropTypes.object,
  data: PropTypes.array,
  totalCount: PropTypes.number,
  fetchData: PropTypes.func,
  dataFetchedHandler: PropTypes.func,
  queryParams: PropTypes.bool,
  rowsSelectable: PropTypes.bool,
  onRowSelectionChange: PropTypes.func,
  columnDecorators: PropTypes.object,
  headerTooltips: PropTypes.object,
  search: PropTypes.bool,

  // Works, but still adds a sortOrderDirection to the query param string.
  // This is because the default values param deleting isn't taking into
  // consideration this new prop.
  // TODO: Fix it. When this one is set, then it's deleted from the query param string
  // when it's the same, basically overriding the DEFAULT_VALUES object.
  //
  // TODO: Another bug... define it, and when entering it says ?sortOrderDirection=desc,
  // but if you change the 'rows per page', then ?sortOrderDirection=desc will disappear.
  defaultSortDirection: PropTypes.string
};

// TODO: Yet another bug. When going back in the browser, query parameters will change, but
// the table won't react.

export default withRouter(GenericTable);
