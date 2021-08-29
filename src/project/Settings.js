import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ProjectService from '../services/ProjectService';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { toast } from 'react-toastify';

export default class Settings extends React.Component{
  constructor(){
    super();
    this.deleteConfirmInput = null;
    this.state = {
      name: '',
      description: '',
      published: false,
      project: null,
      loadingSaving: false,
      deleteConfirmVisible: false,
      typeProjectNameDeleteConfirm: '',
      deletionStarted: false // Prevent delete modal to be closed (because the page will redirect when the deletion process finishes anyway)
    };
  }

  static getDerivedStateFromProps(props, state){
    // Note: that if the project is updated, but nothing changes (i.e. name and other fields have the same value),
    // then the updatedAt field will not change. This might lead to unexpected bugs if this is not taken into consideration.
    if(state.project && state.project.updatedAt === props.project.updatedAt){
      return {};
    }
    let project = props.project;
    return {
      project,
      name: project.name || '',
      description: project.description || '',
      published: project.published || false
    };
  }

  onChangeName = ev => {
    this.setState({ name: ev.target.value });
  }

  onChangeDescription = ev => {
    this.setState({ description: ev.target.value });
  }

  onChangePublished = () => {
    this.setState({ published: !this.state.published });
  }

  saveProjectSettings = ev => {
    ev.preventDefault();
    this.setState({
      loadingSaving: true
    });
    let project = {
      name: this.state.name,
      description: this.state.description,
      published: this.state.published
    };
    ProjectService.update(this.props.project.id, { project })
    .then(project => {
      this.props.updateProject(project);
      this.setState({ loadingSaving: false });
      toast.success("Settings saved");
    });
  }

  onChangeTypeProjectNameDeleteConfirm = ev => {
    this.setState({ typeProjectNameDeleteConfirm: ev.target.value });
  }

  toggleDeleteConfirmModal = value => {
    if(this.state.deletionStarted){
      // If the deletion process started, then prevent any action.
      return;
    }
    let newState = { deleteConfirmVisible: value }

    // When closing modal
    if(!value){
      newState.typeProjectNameDeleteConfirm = '';
    }
    
    this.setState(newState, () => {
      if(this.state.deleteConfirmVisible){
        this.deleteConfirmInput.focus();
      }
    });
  }

  executeProjectDeletion = () => {
    this.setState({ deletionStarted: true });
    this.props.deleteProject();
  }

  render(){
    return(
      <Container fluid>
        <Row>
          <Col>
            <h3>Project settings</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form onSubmit={this.saveProjectSettings}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control placeholder={this.state.project.name} value={this.state.name} onChange={this.onChangeName}/>
              </Form.Group>

              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control placeholder={this.state.project.description} value={this.state.description} onChange={this.onChangeDescription}/>
              </Form.Group>

              <Form.Group>
                <Form.Check type='checkbox' label='Published' id='published-checkbox' defaultChecked={this.state.published} onChange={this.onChangePublished}/>
                <Form.Text className='text-muted'>
                  If this project is still in development, or has bugs and you don't want users to access it, don't check this checkbox. TODO: Who can still access?
                </Form.Text>
              </Form.Group>

              <Button variant='primary' type='submit' disabled={this.state.loadingSaving}>
                Save
              </Button>
            </Form>

            <hr/>

            <Button variant='danger' type='button' disabled={this.state.loadingSaving} onClick={() => { this.toggleDeleteConfirmModal(true) }}>
              Delete project
            </Button>

            <Modal
              show={this.state.deleteConfirmVisible}
              onHide={() => this.toggleDeleteConfirmModal(false)}
              aria-labelledby="example-modal-sizes-title-sm"
              >
              <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-sm">
                  Caution
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Type project name to confirm. Deletion cannot be undone.</Form.Label>
                  <Form.Control
                  disabled={this.state.deletionStarted}
                  value={this.state.typeProjectNameDeleteConfirm}
                  onChange={this.onChangeTypeProjectNameDeleteConfirm}
                  ref={ele => this.deleteConfirmInput = ele}/>
                  <Form.Text className='text-muted'>
                    Case sensitive
                  </Form.Text>
                </Form.Group>
                <Button
                variant='danger'
                type='button'
                onClick={this.executeProjectDeletion}
                disabled={this.state.deletionStarted || this.state.typeProjectNameDeleteConfirm !== this.state.project.name}>
                  Confirm deletion
                </Button>
              </Modal.Body>
            </Modal>
          </Col>
        </Row>
      </Container>
    );
  }
}
