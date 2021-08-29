import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ConnectionService from '../services/ConnectionService';
import Modal from 'react-bootstrap/Modal';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectionForm from './ConnectionForm';

class ConnectionAddButton extends React.Component{
  constructor(){
    super();
    this.state = {
      visible: false,
      createInProgress: false,
      newConnection: {}
    };
  }

  toggle = bool => {
    this.setState({
      visible: bool,
      createInProgress: false
    });
  }

  onFormDataChange = formData => {
    this.setState({
      newConnection: formData
    });
  }

  createConnection = ev => {
    ev.preventDefault();

    this.setState({
      createInProgress: true
    });

    ConnectionService.upsert(this.props.project.id, { connection: this.state.newConnection })
    .then(connection => {
      this.toggle(false);
      this.props.onConnectionUpserted(connection);
    });
  }

  render(){
    return (
      <div className={this.props.className}>
        <Button block variant='success' onClick={() => { this.toggle(true) }}>
          <FontAwesomeIcon icon={faPlus} /> Add connection
        </Button>

        <Modal
          show={this.state.visible}
          onHide={() => this.toggle(false)}
          aria-labelledby="example-modal-sizes-title-sm"
          >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-sm">
              Create new connection
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.createConnection}>
              <ConnectionForm onFormDataChange={this.onFormDataChange} newConnection={true}/>
              <Button block type='submit' disabled={this.state.createInProgress}>Create connection</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ConnectionAddButton;
