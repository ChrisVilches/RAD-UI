import React from 'react';
import { MDBDataTable } from 'mdbreact';
import QueryExecutionService from '../services/QueryExecutionService';

class QueryResult extends React.Component{
  constructor(){
    super();
    this.state = {
      table: null,
      lastCompletedExecutionId: -1,
      lastFetchedExecutionId: -1
    };
  }

  componentDidUpdate(){
    if(this.shouldFetchTable()){
      let execId = this.props.lastRequestedExecutionId;
      console.log(`Fetching results from execution ID=${execId}`)
      this.setTableData(execId);
    }
  }

  // It's extremely important to not execute this several times.
  // Note that React might execute this at any time.
  shouldFetchTable(){
    let requested = this.props.lastRequestedExecutionId;
    let completed = this.props.lastCompletedExecutionId;
    let fetched = this.state.lastFetchedExecutionId;

    // Without this, the table will fetch unnecessarily when (AND conditions):
    // - Some other event such as a click triggers component update.
    // - The fetching is in progress.
    // - No new completed result exists.
    if(this.state.lockFetching){ return false; }

    // Not waiting for any execution to be completed.
    if(requested === null){ return false; }

    // Requested one was already fetched.
    if(requested === fetched){ return false; }

    // The completed one matches the one requiring.
    return requested === completed;
  }

  toggleLockFetch(lock){
    this.setState({
      lockFetching: lock
    });
  }

  setTableData(executionId){
    this.toggleLockFetch(true);
    QueryExecutionService.results(executionId)
    .then(table => {
      this.setState(() => {
        let columns = table.headers.map(field => {
          return {
            label: field,
            field: field,
            sort: table.page ? 'disabled' : 'asc'
          };
        });

        return {
          lastFetchedExecutionId: executionId,
          table: {
            columns,
            rows: table.rows,
            page: table.page
          }
        };
      }, () => { this.toggleLockFetch(false); });
    });
  }

  render(){
    if(this.state.table == null){
      return null;
    }
    return (
      <div>
        <p>
        {this.state.table.page ? 'Data is too large and will be shown paginated via server (sorting disabled).' : 'All data is being sorted and paginated on the frontend.'}
        </p>
        <MDBDataTable
        striped
        bordered
        hover
        data={this.state.table}/>
      </div>
    );
  }
}

export default QueryResult;
