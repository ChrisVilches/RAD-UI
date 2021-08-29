import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ProjectService from '../services/ProjectService';
import { withRouter } from 'react-router';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class ProjectAdd extends React.Component {
  constructor() {
    super();
    this.projectNameInputRef = null;
    this.state = {
      newProjectName: ''
    };
  }

  toggleNewProjectModalShow = value => {
    this.setState({
      newProjectModalShow: value
    }, () => {
      try{
        this.projectNameInputRef.focus();
      } catch(_){
      }
    });
  }

  clearForm = () => {
    this.setState({
      newProjectDescription: '',
      newProjectName: ''
    });
  }

  onChangeNewProjectDescription = e => {
    this.setState({
      newProjectDescription: e.target.value
    });
  }

  onChangeNewProjectName = e => {
    this.setState({
      newProjectName: e.target.value
    });
  }

  createNewProject = ev => {
    ev.preventDefault();
    let name = this.state.newProjectName.trim();
    if(name.length === 0){
      return;
    }
    ProjectService.create(name)
    .then(result => {
      this.props.appendNewlyAddedProject(result);
      this.toggleNewProjectModalShow(false);
      this.clearForm();
    });
  }

  render() {
    return (
      <div className={this.props.className}>
        <Button block variant='success' onClick={() => { this.toggleNewProjectModalShow(true) }}>
          <FontAwesomeIcon icon={faPlus} /> Add project
        </Button>

        <Modal
          show={this.state.newProjectModalShow}
          onHide={() => this.toggleNewProjectModalShow(false)}
          aria-labelledby="example-modal-sizes-title-sm"
          >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-sm">
              Add Project
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.createNewProject}>
              <Form.Group>
                <Form.Control ref={ele => this.projectNameInputRef = ele} placeholder="Project name" value={this.state.newProjectName} onChange={this.onChangeNewProjectName}/>
              </Form.Group>

              <Button variant='primary' type='submit' disabled={!this.state.newProjectName}>
                Create
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default withRouter(ProjectAdd);
