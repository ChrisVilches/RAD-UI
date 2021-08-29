import React from 'react';
import GenericTable from '../GenericTable';
import ProjectService from '../services/ProjectService';
import Util from '../Util';
import Dropdown from 'react-bootstrap/Dropdown';
import './ProjectUsers.scss';
import { Container, Row, Col } from 'react-bootstrap';
import UserIconName from '../users/UserIconName';
import Toggle from 'react-toggle';

const LABELS = {
  id: 'User',
  superPermission: 'Super user'
};

const HEADER_TOOLTIPS = {
  userType: 'Type of user',
  executionPermission: 'Users that can execute queries',
  id: 'just for testing the tooltip does not glitch when sorting. DOES NOT WORK!! It still shows a "Sort" for sortable columns, duh. Also you have to click twice to make it work (WTF)'
};

export default class ProjectUsers extends React.Component{
  constructor(){
    super();
    this.state = {
      rows: [],
      selectedIndexes: [],
      totalCount: 0,
      columns: {},
      operationInProgress: false
    };
  }

  // TODO: This same code is used in many places... remove boiler plate?
  fetchData = opts => {
    let backendParams = {
      p: opts.page,
      perPage: opts.rowsPerPage,
      sortBy: opts.sortOrder.name,
      sortByDir: opts.sortOrder.direction,
      keyword: opts.searchText
    }

    Util.removeEmptyValues(backendParams);

    return ProjectService.participatingUsers(this.props.project.id, backendParams);
  }

  // Assign or remove (bool) permission type.
  // If userIds is not specified, it will use the checked rows.
  changePermission = (permissionType, bool, userIds = null) => {
    this.setState({ operationInProgress: true });

    if(userIds === null){
      // Use the selected rows from the table.
      // The selected rows contain only indexes, so convert those to user IDs.
      userIds = this.state.selectedIndexes.map(idx => this.state.rows[idx].id);
    }

    ProjectService.updateUserPermissionsBatch(this.props.project.id, userIds, permissionType, bool)
    .then(usersChanged => {
      let userMap = {};
      usersChanged.forEach(user => { userMap[user.id] = user; });
      this.setState(state => {
        let rows = state.rows;
        rows = rows.map(user => {
          let id = user.id;
          let newUser = userMap[id];
          return newUser ? newUser : user;
        });
        return { rows, operationInProgress: false };
      });
    });
  }

  dataFetchedHandler = res => {
    this.setState({
      columns: res.columns,
      rows: res.data,
      totalCount: res.total
    });
  }

  onRowSelectionChange = selectedIndexes => {
    this.setState({ selectedIndexes });
  }

  decorateSwitch = (permissionType, bool, user) => {
    let isSuper = user.userType === 'super';
    let participating = user.userType === 'super' || user.userType === 'normal';
    let switchDisabled = isSuper || !participating || this.state.operationInProgress;
    let newValue = !bool;
    let onChange = () => { this.changePermission(permissionType, newValue, [user.id]); };
    // TODO: When filtering the table, the checkboxes that are in the same rows will change in an animated way. This behavior is wrong.
    // This can also be replicated by sorting the table differently.
    return <Toggle icons={false} checked={bool} disabled={switchDisabled} onChange={onChange}/>;
  }

  decorateSwitchExecution = (bool, row) => { return this.decorateSwitch('execution', bool, row); }
  decorateSwitchDevelop = (bool, row) => { return this.decorateSwitch('develop', bool, row); }
  decorateSwitchPublish = (bool, row) => { return this.decorateSwitch('publish', bool, row); }

  decorateUserType = userType => {
    if(typeof userType !== 'string'){ return userType; }
    let labels = {
      super: 'Super user',
      not_participating: 'Not participating',
      normal: 'Normal'
    }

    let text = labels.hasOwnProperty(userType) ? labels[userType] : Util.prettyCase(userType);

    if(userType === 'super'){
      return <span className='table-type-label table-type-label-blue'>{text}</span>;
    } else if(userType === 'normal'){
      return <span className='table-type-label table-type-label-green'>{text}</span>;
    }
    // 'not participating' and any other (prettycased) unknown label (this shouldn't happen though).
    return <span className='table-type-label table-type-label-gray'>{text}</span>;
  }

  decorateUser = (id, user) => {
    return <UserIconName email={user.email} id={id} icon={user.icon}/>
  }

  render(){
    let buttonsDisabled = this.state.operationInProgress || this.state.selectedIndexes.length === 0;
    return(
      <Container fluid>
        <Row>
          <Col>
            <div className='project-users-toolbar mb-2'>
              <Dropdown className='dropdown dropdown-normal'>
                <Dropdown.Toggle variant="" id="dropdown-basic" disabled={buttonsDisabled}>
                  Execution permission
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.changePermission('execution', true)}>Add</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.changePermission('execution', false)}>Remove</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className='dropdown dropdown-normal'>
                <Dropdown.Toggle variant="" id="dropdown-basic" disabled={buttonsDisabled}>
                  Develop permission
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.changePermission('develop', true)}>Add</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.changePermission('develop', false)}>Remove</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown className='dropdown dropdown-normal'>
                <Dropdown.Toggle variant="" id="dropdown-basic" disabled={buttonsDisabled}>
                  Publish permission
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.changePermission('publish', true)}>Add</Dropdown.Item>
                  <Dropdown.Item onClick={() => this.changePermission('publish', false)}>Remove</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* TODO: Implement */}
              <Dropdown className='dropdown dropdown-normal'>
                <Dropdown.Toggle variant="" id="dropdown-basic" disabled={buttonsDisabled}>
                  Participation
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item>Join project</Dropdown.Item>
                  <Dropdown.Item>Abandon project</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <GenericTable
              search={true}
              headerLabels={LABELS}
              rowsSelectable={true}
              fetchData={this.fetchData}
              dataFetchedHandler={this.dataFetchedHandler}
              columns={this.state.columns}
              data={this.state.rows}
              totalCount={this.state.totalCount}
              onRowSelectionChange={this.onRowSelectionChange}
              columnDecorators={{
                id: this.decorateUser,
                userType: this.decorateUserType,
                developPermission: this.decorateSwitchDevelop,
                executionPermission: this.decorateSwitchExecution,
                publishPermission: this.decorateSwitchPublish
              }}
              headerTooltips={HEADER_TOOLTIPS}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}
