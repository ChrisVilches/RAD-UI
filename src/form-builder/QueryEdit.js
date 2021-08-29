import React from 'react';
import IEditable from './IEditable';
import ContainerBuilder from './ContainerBuilder';
import ElementConfiguration from './ElementConfiguration';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Toggle from 'react-toggle';
import Container from 'react-bootstrap/Container';
import {withRouter} from 'react-router';
import ConnectionService from '../services/ConnectionService';
import ConnectionTitle from '../connections/ConnectionTitle';
import QueryService from '../services/QueryService';
import GenericTable from '../GenericTable';
import Util from '../Util';
import './QueryEdit.scss';

class QueryEdit extends IEditable {
  constructor(){
    super();

    // Add other properties that are only in Query Edit view.
    // Other properties come from IEditable constructor.
    this.state = Object.assign(this.state, {
      // TODO comment structure
      query: null,
      codeTextarea: "",
      commentInput: "",
      connections: {}
    });
  }
  componentDidMount(){
    let queryId = +this.props.match.params.queryId;
    QueryService.show(queryId)
    .then(query => {
      let projectId = query.projectId;

      if(query.latestRevision === null){
        query.latestRevision = { content: { sql: '' } };
      }

      this.setState({
        query,
        container: query.container,
        codeTextarea: query.latestRevision.content.sql
      });

      this.loadConnections(projectId);
    });
  }

  loadConnections = projectId => {
    ConnectionService.list(projectId)
    .then(connections => {
      this.setState({
        connections
      });
    });
  }

  onChangeCode = e => {
    e.persist();
    this.setState({
      codeTextarea: e.target.value
    });
  }

  onChangeComment = e => {
    e.persist();
    this.setState({
      commentInput: e.target.value
    });
  }

  saveChanges = () => {
    IEditable.prototype.saveChanges.bind(this)('query', {
      query: {
        comment: this.state.commentInput,
        code: this.state.codeTextarea,
        container: this.state.container
      }
    }, this.props.match.params.queryId);
  }

  toggleAllowConnection = connId => {
    let currentValue = this.state.connections.rows.find(conn => conn.connection.id === connId).canUseConnection;//this.isConnectionAllowed(connId);
    let queryId = +this.props.match.params.queryId;

    let executableMethod = currentValue ? QueryService.deleteFromConnection : QueryService.addToConnection;

    executableMethod(queryId, connId)
    .then(connections => {
      // 'connections' has list of useable connections.
      let canBeUsed = typeof connections.find(conn => conn.id === connId) !== 'undefined';
      this.setState(state => {
        let connections = state.connections;
        connections.rows.find(conn => conn.connection.id === connId).canUseConnection = canBeUsed;
        return { connections };
      });
    });
  }

  isConnectionAllowed = connId => {
    let connectionsAllowed = this.state.query.connectionsAllowedToQuery;
    return connectionsAllowed.findIndex(c => c.id === connId) > -1;
  }

  toggleChangeLogVisibility = bool => {
    this.setState({
      changeLogModalVisible: bool
    });
  }

  fetchConnections = opts => {
    let backendParams = {
      p: opts.page,
      perPage: opts.rowsPerPage,
      sortBy: opts.sortOrder.name,
      sortByDir: opts.sortOrder.direction,
      keyword: opts.searchText
    }

    Util.removeEmptyValues(backendParams);
    let queryId = this.state.query.id;
    return QueryService.queryUseables(queryId, backendParams);
  }

  connectionsFetchedHandler = res => {
    this.setState({
      connections: {
        columns: {
          connection: { sort: false },
          canUseConnection: { sort: false }
        },
        rows: res.data,
        totalCount: res.length
      }
    });
  }

  decorateConnection = connection => {
    return <ConnectionTitle {...connection}/>
  }

  decorateCanUseConnection = (bool, row) => {
    if(typeof bool !== 'boolean'){
      return bool;
    }

    let conn = row.connection;
    return <Toggle icons={false} onChange={() => { this.toggleAllowConnection(conn.id) }} checked={bool}/>
  }

  render(){
    if(this.state.query == null){
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
              notifyUpdatedContainerElements={this.updateContainer}
              nodesWithErrors={this.state.nodesWithErrors}
              initElements={this.state.container.elements}
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
          <Row>
            <Col>
              <hr/>

              <h3>Code</h3>

              <div>
                <textarea value={this.state.codeTextarea} onChange={this.onChangeCode} rows='10' style={{ width: '100%' }}/>
                <br></br>
                <p>Explain your edits (<a href='#' onClick={() => { this.toggleChangeLogVisibility(true) }}>See change log</a>)</p>
                <input className='query-commit-message'
                placeholder='Write about what changed. Both the code and this comment will be stored in the query history log.'
                value={this.state.commentInput}
                onChange={this.onChangeComment}
                disabled={this.state.codeTextarea === this.state.query.latestRevision.content.sql}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <hr/>

              <h3>Connections</h3>

              <p>Select which connections can be used with this query.</p>

              <GenericTable
                fetchData={this.fetchConnections}
                dataFetchedHandler={this.connectionsFetchedHandler}
                columns={this.state.connections.columns}
                data={this.state.connections.rows}
                totalCount={this.state.connections.totalCount}
                columnDecorators={{ connection: this.decorateConnection, canUseConnection: this.decorateCanUseConnection }}
                />
            </Col>
          </Row>
        </Container>

        <Modal
          size="lg"
          show={this.state.changeLogModalVisible}
          onHide={() => this.toggleChangeLogVisibility(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Change log
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.query.log.map((l, idx) => (
              <div key={idx} className="mb-4">
                <code>{l.content.sql}</code><br/>
                {l.comment}
              </div>
            ))}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default withRouter(QueryEdit);
