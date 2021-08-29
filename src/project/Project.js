import React from 'react';
import './Project.scss';
import Spinner from '../decoration/Spinner';
import {from, forkJoin} from 'rxjs';
import {withRouter} from 'react-router';
import ConnectionService from '../services/ConnectionService';
import ViewService from '../services/ViewService';
import ProjectService from '../services/ProjectService';
import Connections from './Connections';
import {
  Switch,
  Redirect,
  Route
} from "react-router-dom";
import Activity from './Activity';
import Settings from './Settings';
import ProjectUsers from './ProjectUsers';
import Util from '../Util';
import Summary from './Summary';
import { URL_COMPANY_PREFIX } from '../Constants';
import ProjectMenu from './ProjectMenu';
import ViewList from './ViewList';

class Project extends React.Component {
  constructor(){
    super();
    this.state = {
      projectId: null,
      views: null,
      project: null,
      connections: null
    };
  }

  static getDerivedStateFromProps(props){
    return {
      projectId: props.match.params.projectId,
      tabName: props.match.params.tabName
    };
  }

  componentDidMount() {
    let views$ = from(ViewService.list(this.state.projectId));
    let project$ = from(ProjectService.find(this.state.projectId));
    let connections$ = from(ConnectionService.list(this.state.projectId));

    forkJoin(
      views$,
      project$,
      connections$
    ).subscribe(data => {
      this.setState({
        views: data[0],
        project: data[1],
        connections: data[2]
      });
    });
  }

  // TODO: Perhaps all these connection-related methods and state could be moved
  // to the Connections component, but the problem is that we still need to have
  // the connection count at the top. How can it be implemented?
  // Just appends a connection that the child component (Connections) creates.
  // If it's already on the list, update it.
  // It's executed from that component.
  onConnectionUpserted = connection => {
    if(connection.hasOwnProperty('pass')){
      console.warn('pass was included in the response from the backend. It must NOT include it!');
    }
    this.setState(state => {
      let connections = state.connections;
      let idx = connections.findIndex(c => c.id === connection.id)
      if(idx > -1){
        // Already exists, so update.
        connections[idx] = connection;
      } else {
        // Does not exist, so append.
        connections.push(connection);
      }
      return { connections }
    });
  }

  onConnectionRemoved = connectionId => {
    this.setState(state => {
      let connections = state.connections.filter(conn => conn.id !== connectionId);
      return {
        connections
      }
    });
  }

  updateProject = project => {
    this.setState(state => {
      let newProject = Util.objectAssignExistingKeys(state.project, project);
      return {
        project: newProject
      };
    });
  }

  deleteProject = () => {
    ProjectService.delete(this.state.project.id);
  }

  render(){
    // This has the same effect as doing a forkJoin.
    // But using forkJoin might make it easier.
    if(this.state.project === null || this.state.connections === null || this.state.views === null){
      return (
        <div className="padded-container">
          <Spinner/>
        </div>
      );
    }

    return (
      <div>
        <ProjectMenu tabName={this.state.tabName} viewsCount={this.state.project.viewsCount} participantsCount={this.state.project.participantsCount} connectionsCount={this.state.project.connectionsCount}/>

        <div className="padded-container">
          {/*
            TODO:
            Data should load again when clicking on different tabs.
            The reason why I haven't done it like that is because I need the numbers (counts) in
            the tabs, but they can be obtained with different strategies.
          */}
          <div className='project-menu-view-wrapper'>
            <Switch>
              <Route
                path={`/${URL_COMPANY_PREFIX}/:companyId/project/:projectId`}
                render={({ match: { url } }) => (
                <Switch>
                  <Route exact path={`${url}/summary`}>
                    <Summary companyId={this.props.match.params.companyId} project={this.state.project}/>
                  </Route>
                  <Route exact path={`${url}/settings`}>
                    <Settings companyId={this.props.match.params.companyId} project={this.state.project} updateProject={this.updateProject} deleteProject={this.deleteProject}/>
                  </Route>
                  <Route exact path={`${url}/participants`}>
                    <ProjectUsers companyId={this.props.match.params.companyId} project={this.state.project}/>
                  </Route>
                  <Route exact path={`${url}/views`}>
                    <ViewList project={this.state.project}/>
                  </Route>
                  <Route exact path={`${url}/connections`}>
                    {this.state.project.companyPermissions && this.state.project.companyPermissions.connectionPermission ? (
                      <Connections
                      companyId={this.props.match.params.companyId}
                      project={this.state.project}
                      connections={this.state.connections}
                      onConnectionUpserted={this.onConnectionUpserted}
                      onConnectionRemoved={this.onConnectionRemoved}
                      />
                    ) : 'You cannot manage connections.'}
                  </Route>
                  <Route exact path={`${url}/activity`}>
                    <Activity companyId={this.props.match.params.companyId} projectId={this.props.match.params.projectId}/>
                  </Route>
                  <Redirect to={`${url}/summary`}/>
                </Switch>)}
              />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Project);
