import React from 'react';
import Form from '../Form'; // TODO: Rename this component 'import Form from '../Form';'. It's difficult to understand which Form it is.
import QueryConnectionToolbar from './QueryConnectionToolbar';
import QueryResult from './QueryResult';
import QueryMenu from './QueryMenu';

export default function Query(props){
  return (
    <div className='query-container'>
      <div className='query-title-bar'>
        <div className='query-title'>
          <h4>
          {props.query.name}
          </h4>
        </div>

          {props.developPermission ? <QueryMenu {...props}/> : ''}
      </div>
      <p>{props.query.description}</p>
      <Form
      getData={props.getData}
      elements={props.query.container.elements}
      getErrorsInput={props.getErrorsInput}/>

      <QueryResult
      queryId={props.query.id}
      lastCompletedExecutionId={props.lastCompletedExecutionId}
      lastRequestedExecutionId={props.lastRequestedExecutionId}/>

      <QueryConnectionToolbar
      queryId={props.query.id}
      executeQuery={props.executeQuery}
      connections={props.query.connectionsAllowedToUser}
      executionPermission={props.executionPermission}/>
    </div>
  );
}
