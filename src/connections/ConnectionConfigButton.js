import React from 'react';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import CustomTooltip from '../decoration/CustomTooltip';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectionService from '../services/ConnectionService';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ConnectionForm from './ConnectionForm';

class ConnectionManageUsersButton extends React.Component{

  constructor(){
    super();
    this.state = {
      visible: false,
      loading: false,
      formData: {},
      updateInProgress: false
    };
  }

  onFormDataChange = formData => {
    this.setState({ formData });
  }

  toggle = bool => {
    this.setState({
      loading: bool,
      visible: bool,
      updateInProgress: false
    });
  }

  updateConnection = ev => {
    ev.preventDefault();

    this.setState({
      updateInProgress: true
    });

    let projectId = this.props.project.id;
    let connectionData = { id: this.props.connection.id };
    Object.assign(connectionData, this.state.formData);

    ConnectionService.upsert(projectId, { connection: connectionData })
    .then(connection => {
      this.toggle(false);
      this.props.onConnectionUpserted(connection);
    })
    .catch(() => {});
  }

  render(){
    return (
      <div>
        <CustomTooltip placement="bottom" text="Configure this connection.">
          <button className='small-text' onClick={() => { this.toggle(true) }}>
            <FontAwesomeIcon icon={faEdit}/>
          </button>
        </CustomTooltip>

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
            <Form onSubmit={this.updateConnection}>
              <ConnectionForm connection={this.props.connection} onFormDataChange={this.onFormDataChange}/>
              <Button type='submit' disabled={this.state.updateInProgress}>Update connection</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ConnectionManageUsersButton;
