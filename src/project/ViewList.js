import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import ViewService from '../services/ViewService';
import Link from "react-router-dom/Link";

export default class ViewList extends React.Component{
  constructor(){
    super();
    this.state = {
      views: null
    };
  }

  componentDidMount() {
    ViewService.list(this.props.project.id)
    .then(views => {
      this.setState({ views });
    })
  }

  render(){
    if(this.state.views === null) return 'Loading...';

    return (
      <Container fluid>
        <Row>
          <Col>
            <h3 className='float-left'>Views</h3>
          </Col>
        </Row>
        <Row>
          {this.state.views.length === 0 ? <Col>Currently there are no views.</Col> : ''}
          {this.state.views.map((view, i) => (
            <Col key={i} lg={6} xl={4} className='grid-square-widget'>
              <div className='grid-square-widget-content'>
                <Link className='primary-link' to={`./view/${view.id}`}>{view.name}</Link>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}
