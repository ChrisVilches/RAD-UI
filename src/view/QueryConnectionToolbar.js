import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ConnectionTitle from '../connections/ConnectionTitle';

export default class QueryConnectionToolbar extends React.Component{
  render(){
    if(!this.props.executionPermission){
      return <span>You don't have permissions to execute this query.</span>;
    }

    if(this.props.connections.length === 0){
      return <Alert variant='warning'>You have permissions to execute, but you weren't assigned any connection to use yet.</Alert>;
    }

    return (
      <div>
      {this.props.connections.map((conn, key) => (
        <div className='execute-with-connection-label' key={key}>
          <Button variant='outline-dark' onClick={() => { this.props.executeQuery(this.props.queryId, conn.id) }}>
            <ConnectionTitle color={conn.color} name={conn.name}/>
          </Button>
        </div>
      ))}
      </div>
    );
  }
}
