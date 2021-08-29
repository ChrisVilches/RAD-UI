import React from 'react';
import QueryExecutionService from '../services/QueryExecutionService';
import GenericTable from '../GenericTable.js';
import Util from '../Util';
import ConnectionTitle from '../connections/ConnectionTitle';
import { Row, Col, Container } from 'react-bootstrap';
import UserIconName from '../users/UserIconName';
import Spinner from '../decoration/Spinner';

const headerLabels = {
  id: 'Execution ID',
  query: 'Query',
  connection: 'Connection',
  status: 'Status',
  userId: 'User',
  connectionId: 'Connection',
  queryId: 'Query',
  error: 'Error Type',
  createdAt: 'Date created',
  rowCount: 'Row count',
  executionStartedAt: 'Start Time',
  executionEndedAt: 'End Time'
};

export default class Activity extends React.Component{
  constructor(){
    super();

    this.state = {
      projectId: null,
      isLoading: false,
      columns: {},
      data: []
    };
  }

  decorateErrors = error => {
    if(typeof error !== 'string'){ return error; }
    return <span className='table-type-label table-type-label-red'>{error}</span>;
  }

  decorateStatus = (status, row) => {
    if(typeof status !== 'string'){ return status; }
    let classColor = {
      idle: 'blue',
      progress: 'orange',
      cancelled: 'gray',
      finished: 'green',
      finishedWithError: 'light-green'
    };

    let color = classColor.cancelled; // Use this in case of error (i.e. unknown)

    if(classColor.hasOwnProperty(status)){
      color = classColor[status];
    }

    if(row.error){
      color = classColor.finishedWithError;
    }

    return <span className={`table-type-label table-type-label-${color}`}>{status}</span>;
  }

  decorateConnection = connection => {
    return <ConnectionTitle {...connection}/>
  }

  decorateUser = (userId, row) => {
    const user = row.user;
    return <UserIconName email={user.email} id={userId} icon={user.icon}/>
  }

  dataFetchedHandler = res => {
    let newState = {
      totalCount: res.total,
      columns: res.columns,
      data: res.data,
      isLoading: false
    };
    this.setState(newState);
  }

  fetchData = (opts) => {
    this.setState({ isLoading: true });
    let backendParams = {
      p: opts.page,
      perPage: opts.rowsPerPage,
      sortBy: opts.sortOrder.name,
      sortByDir: opts.sortOrder.direction,
      keyword: opts.searchText
    }

    Util.removeEmptyValues(backendParams);

    return QueryExecutionService.activity(this.props.projectId, backendParams);
  }

  render(){
    return (
      <Container fluid>
        <Row>
          <Col>
          <h2>Activity</h2>
          </Col>
        </Row>
        <Row>
          <Col>
          {/* TODO: This looks glitchy as fuck.
              There are two spinners (project parent view and activity spinner).
              Also if the table isn't rendered it won't work because it needs to be
              present, for some reason I don't remember.
              Make the table also have some loading animation if possible. Or something similar.
          */}
          {this.state.isLoading ? <Spinner/> : ''}
            <GenericTable
            queryParams={true}
            headerLabels={headerLabels}
            columns={this.state.columns}
            data={this.state.data}
            totalCount={this.state.totalCount}
            fetchData={this.fetchData}
            dataFetchedHandler={this.dataFetchedHandler}
            columnDecorators={{ error: this.decorateErrors, status: this.decorateStatus, connectionId: this.decorateConnection, userId: this.decorateUser }}
            defaultSortDirection='desc'
          />
          </Col>
        </Row>
      </Container>
    );
  }
}
