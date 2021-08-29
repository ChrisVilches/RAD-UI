import React from 'react';
import './ErrorMessages.scss';
import Alert from 'react-bootstrap/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function ErrorMessages(props){
  if(!props.messages){
    return "";
  }
  return (
    <Alert variant="danger" className="error-container">
    {props.messages.map((msg, i) => (
      <div>
        <FontAwesomeIcon className="error-icon" icon={faExclamationTriangle}></FontAwesomeIcon>
        <span className="error-text" key={i}>{msg}</span>
      </div>
    ))}
    </Alert>
  );
}
