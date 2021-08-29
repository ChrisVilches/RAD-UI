import React from 'react';
import '../connections/Connections.scss';
import ConnectionItem from '../connections/ConnectionItem';
import ConnectionAddButton from '../connections/ConnectionAddButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

export default class Connections extends React.Component{
  constructor(){
    super();
    this.state = {
      connectionConfigModalShow: false,
      loadingSaving: false,
      connConfig: {}
    };
  }
  render(){
    return(
      <Container fluid>
        <Row>
          <Col>
            <h3 className='float-left'>Connections</h3>
            <ConnectionAddButton className='float-md-right mb-2' {...this.props}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className='mb-4'>Edit connections that can be used in this project.</div>
          </Col>
        </Row>
        <Row>
          {this.props.connections.length === 0 ? "No connections added." : (
            this.props.connections.map((conn, i) => (
              <ConnectionItem {...this.props} key={i} connection={conn}/>
            ))
          )}
        </Row>
      </Container>
    );
  }
}
