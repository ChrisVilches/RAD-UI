import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

export default function Error404(props){
  return (
    <div className="padded-container">
      <Container fluid>
        <Row>
          <Col>
            <h3>404 Error</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <p>The page was not found.</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
