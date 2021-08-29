import React from 'react';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';

export default class Readme extends React.Component{
  constructor(){
    super();
    this.state = {
      readmeVisible: false
    };
  }

  expandReadme = () => {
    this.setState({ readmeExpanded: true });
  }

  toggleReadmeVisibility = value => {
    this.setState({ readmeVisible: value });
  }

  render(){
    let content = this.props.content;

    if(typeof content !== 'string'){
      return null;
    }

    return (
      <div>          
        <div>
          <FontAwesomeIcon icon={faFile}/> <a href='#' onClick={() => { this.toggleReadmeVisibility(true) }}>See readme</a>
        </div>

        <Modal
          size="lg"
          show={this.state.readmeVisible}
          onHide={() => this.toggleReadmeVisibility(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Readme
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="mb-4">
              <ReactMarkdown source={content}/>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
