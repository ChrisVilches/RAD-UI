import React from 'react';
import { withRouter } from 'react-router';
import './View.scss';
import Form from '../Form';
import Readme from './Readme';
import QueryAdd from './QueryAdd';
import Query from './Query';
import Spinner from '../decoration/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import 'react-json-pretty/themes/monikai.css';
import {from, forkJoin} from 'rxjs';
import QueryService from '../services/QueryService';
import ViewService from '../services/ViewService';
import ProjectService from '../services/ProjectService';
import Cable from '../services/Cable';
import { Link } from 'react-router-dom';
import ViewBreadcrumb from './ViewBreadcrumb';
import Util from '../Util';

class ViewAux extends React.Component {
  constructor(){
    super();
    this.state = {
      view: null,
      project: null,
      globalContainer: {},
      queryResults: {},
      errors: {},
      globalFormData: {},
      queryFormData: {},
      addedQueries: [],
      lastRequestedExecution: {}, // { queryId: queryExecutionId }
      lastCompletedExecutionId: null // Last execution completed, for any query in a view (socket signals all users connected).
    };
  }

  deleteQuery = queryId => {
    if(!window.confirm(`削除する？ query ID = ${queryId}`)){
      return;
    }

    QueryService.delete(queryId)
    .then(data => {
      this.setState(state => {
        let removedId = data.id;
        let view = state.view;
        let filterPredicate = q => q.id !== removedId;
        view.queries = view.queries.filter(filterPredicate);
        return {
          view,
          addedQueries: state.addedQueries.filter(filterPredicate)
        };
      });
    });
  }

  componentWillUnmount(){
    Cable.unsubscribeFromViewEvents();
  }

  handleResultsCompletedEvent(){
    Cable.subscribeToViewEvents(this.props.match.params.viewId, msg => {
      if(msg.status !== 'finished') return;
      let execId = msg.queryExecutionId;
      this.setState({ lastCompletedExecutionId: execId });
    });
  }

  componentDidMount(){
    this.handleResultsCompletedEvent();
    let view$ = from(ViewService.show(this.props.match.params.viewId));
    let project$ = from(ProjectService.find(this.props.match.params.projectId));

    forkJoin(view$, project$).subscribe(data => {
      let view = data[0].view;
      let project = data[1];
      let queryResults = {};

      for(let i=0; i < view.queries.length; i++){
        let query = view.queries[i];
        if(queryResults.hasOwnProperty(query.id)) continue;
        queryResults[query.id] = {};
      }
      this.setState({
        view,
        project,
        globalContainer: view.container,
        queryResults
      });
    });
  }

  getGlobalFormData = (data) => {
    this.setState({ globalFormData: data });
  }

  // Uses partial execution.
  // fn(queryId) => returns (fn2) a function which only requires data
  // fn2(data) => full intended execution
  getQueryLocalFormData = (queryId, data) => {
    if(typeof queryId === 'number' && typeof data === 'undefined'){
      return data => {
        this.setState(state => {
          let queryFormData = state.queryFormData;
          queryFormData[queryId] = data;
          return { queryFormData };
        });
      }
    }

    this.getQueryLocalFormData(queryId)(data);
  }

  // This method is called from elements inside containers (and nested containers),
  // so it must be passed down to all of them.
  getErrorsInput = elementId => {
    if(typeof elementId !== 'number'){
      throw new Error('Element ID must be a number.');
    }

    let globalErrors = this.state.errors.globalFormErrors;
    let queryErrors = this.state.errors.queryFormErrors;

    // Search in both global errors and query errors array.
    for(let i in globalErrors){
      let err = globalErrors[i];
      if(err.id === elementId) return err;
    }

    for(let i in queryErrors){
      let err = queryErrors[i];
      if(err.id === elementId) return err;
    }

    return [];
  }

  executeQuery = (queryId, connId) => {
    // Clear ID of the results to wait for, in order to avoid conflicts (order of execution).
    this.setState(state => {
      let lastRequestedExecution = state.lastRequestedExecution;
      lastRequestedExecution[queryId] = null;
      return { lastRequestedExecution }
    });

    let inputData = {
      globalParams: this.state.globalFormData,
      queryParams: this.state.queryFormData[queryId],
      connectionId: connId
    };

    QueryService.execute(queryId, inputData)
    .then(result => {
      if(!result){ // TODO: This conditional might be wrong. Originally it was 'response.ok' before doing 'response.json()'
        this.setState({
          errors: result
        });
        return;
      }
      this.setState(state => {
        let lastRequestedExecution = state.lastRequestedExecution;
        lastRequestedExecution[queryId] = result.queryExecutionId;
        return { lastRequestedExecution }
      });
    });
  }

  appendNewlyAddedQuery = (query) => {
    this.setState(state => {
      let addedQueries = state.addedQueries;
      addedQueries.push(query);
      return { addedQueries }
    });
  }

  editViewName = newName => {
    ViewService.update(this.state.view.id, { view: { name: newName } })
    .then(view => {
      this.setState(state => {
        let newView = Util.objectAssignExistingKeys(state.view, view);
        return {
          view: newView
        };
      });
    });
  }

  render(){
    if(this.state.view === null || this.state.project === null){
      return (
        <div className='padded-container'>
          <Spinner/>
        </div>
      );
    };

    return (
      <div className="padded-container">
        <Container fluid>
          <Row className='mb-4'>
            <Col md={12}>
              <ViewBreadcrumb
              companyId={this.props.match.params.companyId}
              projectId={this.props.match.params.projectId}
              projectName={this.state.project.name}
              viewName={this.state.view.name}
              developPermission={this.state.project.projectPermissions.developPermission}
              editViewName={this.editViewName}
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Readme content={this.state.view.readme}/>

              <Form
              getData={this.getGlobalFormData}
              elements={this.state.globalContainer.elements}
              getErrorsInput={this.getErrorsInput}/>
              {this.state.project.projectPermissions.developPermission ? (
                <Link to={`./${this.props.match.params.viewId}/edit`}>Edit</Link>
              ) : 'You cannot edit this readme or global params'}
            </Col>
          </Row>

          <hr></hr>

          {this.state.project.projectPermissions.developPermission ? <QueryAdd viewId={this.props.match.params.viewId} appendNewlyAddedQuery={this.appendNewlyAddedQuery}/> : ''}
          <Row>
            {(this.state.view.queries.concat(this.state.addedQueries)).map((q, i) => (
              <Col md={6} key={i} className='query-item'>
                <Query
                getData={this.getQueryLocalFormData(q.id)}
                deleteQuery={this.deleteQuery}
                executeQuery={this.executeQuery}
                lastRequestedExecutionId={this.state.lastRequestedExecution[q.id]}
                lastCompletedExecutionId={this.state.lastCompletedExecutionId}
                getErrorsInput={this.getErrorsInput}
                query={q}
                result={this.state.queryResults[q.id]}
                developPermission={this.state.project.projectPermissions.developPermission}
                executionPermission={this.state.project.projectPermissions.executionPermission}/>
              </Col>
            ))}
          </Row>

        </Container>
      </div>
    );
  }
}

export default withRouter(ViewAux);
