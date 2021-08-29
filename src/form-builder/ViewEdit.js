import React from 'react';
import IEditable from './IEditable';
import ContainerBuilder from './ContainerBuilder';
import ElementConfiguration from './ElementConfiguration';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { withRouter } from 'react-router';
import ViewService from '../services/ViewService';

class ViewEdit extends IEditable {
  constructor(){
    super();
    this.state = {
      container: null,
      selectedElement: null
    }
  }

  componentDidMount(){
    let viewId = +this.props.match.params.viewId;
    ViewService.show(viewId, true)
    .then(res => {
      this.setState({
        container: res.view.container
      });
    });
  }

  saveChanges = () => {
    IEditable.prototype.saveChanges.bind(this)('view', {
      view: {
        container: this.state.container
      }
    }, this.props.match.params.viewId);
  }

  render(){

    if(this.state.container == null){
      return "読み込み中";
    }

    return (
      <div className="padded-container">
        <Container fluid>
          <Row className='mb-2'>
            <Col>
              <Button variant='primary' onClick={this.saveChanges}>
                Save changes
              </Button>
            </Col>
          </Row>
          <Row>
            {
              // For configuring the form component tree
            }
            <Col md={6}>
              <ContainerBuilder
              nodesWithErrors={this.state.nodesWithErrors}
              initElements={this.state.container.elements}
              notifyUpdatedContainerElements={this.updateContainer}
              selectComponent={this.selectComponent}
              containerNodesWithRepeatedVariableNames={this.state.containerNodesWithRepeatedVariableNames}
              />
            </Col>

            {
              // For configuring specific components (NumericInput, TextInput, etc)
            }
            <Col md={6}>
              {
                this.state.selectedElement === null ? "" : (
                  <ElementConfiguration
                  getPathFor={this.getPathFor}
                  isVariableNameRepeated={this.isVariableNameRepeated}
                  notifyChanges={this.changeComponentConfiguration}
                  item={this.state.selectedElement}/>
                )
              }
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withRouter(ViewEdit);
