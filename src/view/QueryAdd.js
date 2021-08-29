import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import QueryService from '../services/QueryService';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class QueryAdd extends React.Component {
  constructor() {
    super();
    this.queryNameInputRef = null;
    this.state = {
      newQueryDescription: '',
      newQueryName: ''
    };
  }

  toggleNewQueryModalShow = value => {
    this.setState({
      newQueryModalShow: value
    }, () => {
      try{
        this.queryNameInputRef.focus();
      } catch(_){
      }
    });
  }

  clearForm = () => {
    this.setState({
      newQueryDescription: '',
      newQueryName: ''
    });
  }

  onChangeNewQueryDescription = e => {
    this.setState({
      newQueryDescription: e.target.value
    });
  }

  onChangeNewQueryName = e => {
    this.setState({
      newQueryName: e.target.value
    });
  }

  createNewQuery = ev => {
    ev.preventDefault();
    let name = this.state.newQueryName.trim();
    let desc = this.state.newQueryDescription.trim();
    if(name.length === 0){
      return;
    }
    QueryService.create(this.props.viewId, name, desc)
    .then(result => {
      // These extra fields are simply so that it doesn't crash
      let requiredFields = {
        connectionsAllowedToUser: [],
        container: { elements: [] }
      };
      this.props.appendNewlyAddedQuery(Object.assign(result, requiredFields));
      this.toggleNewQueryModalShow(false);
      this.clearForm();
    });
  }

  render() {
    return (
      <Row className='mb-4'>
        <Col md={3}>
          <Button block variant='success' onClick={() => { this.toggleNewQueryModalShow(true) }}>
            <FontAwesomeIcon icon={faPlus} /> Add query
          </Button>
        </Col>

        <Modal
          show={this.state.newQueryModalShow}
          onHide={() => this.toggleNewQueryModalShow(false)}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-sm">
              Add Query
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form className="mb-4" onSubmit={this.createNewQuery}>
              <Form.Group>
                <Form.Control ref={ele => this.queryNameInputRef = ele} placeholder="Query name" value={this.state.newQueryName} required onChange={this.onChangeNewQueryName}/>
              </Form.Group>
              <Form.Group>
                <Form.Control placeholder="Query description (optional)" value={this.state.newQueryDescription} onChange={this.onChangeNewQueryDescription}/>
              </Form.Group>

              <Button variant='primary' type='submit' disabled={!this.state.newQueryName.trim()}>
                Create query
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Row>
    );
  }
}

export default QueryAdd;
