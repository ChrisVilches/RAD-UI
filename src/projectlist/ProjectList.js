import React from 'react';
import './ProjectList.scss';
import Spinner from '../decoration/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLock } from '@fortawesome/free-solid-svg-icons';
import {
  Link
} from "react-router-dom";
import {withRouter} from 'react-router';
import CompanyService from '../services/CompanyService';
import Util from '../Util';
import ProjectAdd from './ProjectAdd';
import ProjectService from '../services/ProjectService';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

const emptyState = {
  allProjects: null,
  filteredProjects: [],
  textFilter: ''
  // TODO: It also has 'company', but I don't include it because I don't want to reset it.
  // However, this makes the code a bit unpredictable. Anyway, I want to pass the company
  // as props from the parent component so that I don't have to load it here (because it's
  // the same for the entire app, so it makes sense to load it just once at the app root component
  // or something like that)
};

class ProjectList extends React.Component {
  constructor(){
    super();
    this.filterInputRef = null;
    this.state = emptyState;
  }

  componentDidMount(){
    this.loadProjectList();
    this.loadCompany();   
  }

  autoFocus = (element) => {
    // Autofocus for the keyword input will work only once, at the beginning.
    if(this.filterInputRef === null){
      this.filterInputRef = element;
      this.filterInputRef.focus();
    }
  }

  // TODO: The company object could come from the parent component as props.
  // This is because the full app is in a company context, so it'd better if it just
  // loads once.
  loadCompany = () => {
    CompanyService.currentCompany()
    .then(company => {
      this.setState({
        company
      });
    });
  }
  
  appendNewlyAddedProject = project => {
    // Implemented as 'reload everything',
    // also clear the keyword filter.
    // TODO: Maybe change the behavior to 'go to that new project settings page'.
    console.log(project);
    this.loadProjectList();
  }

  onChangeTextFilter = e => {
    let value = e.target.value;
    this.setState({
      textFilter: value
    }, this.applyFilter);
  }

  applyFilter = () => {
    let keywords = this.state.textFilter.split(' ').map(s => s.trim()).filter(s => s.length > 0);

    if(keywords.length === 0){
      return this.setState(state => {
        return {
          filteredProjects: state.allProjects
        };
      });
    }

    return this.setState(state => {
      let filteredProjects = state.allProjects.filter(proj => {
        let full = ((proj.name || '') + (proj.description || '')).toLowerCase();
        for(let i in keywords){
          let keyword = keywords[i].toLowerCase();
          if(full.search(keyword) > -1){
            return true;
          }
        }
        return false;
      });
      return { filteredProjects };
    });
  }

  loadProjectList = () => {
    this.setState(emptyState, () => {
      ProjectService.list()
      .then(projects => {
        this.setState({
          allProjects: projects,
          filteredProjects: projects,
          textFilter: ''
        });
      });
    });
  }

  toggleFavoriteProject = (projectId) => {
    let project = this.state.allProjects.find(p => p.id === projectId);
    if(!project){
      throw new Error('Project to be favorited/unfavorited does not exist in the list.');
    }
    ProjectService.toggleFavorite(projectId, !project.favorite)
    .then(projectChanges => {
      this.setState(state => {
        let allProjects = state.allProjects;
        let idx = allProjects.findIndex(p => p.id === projectChanges.projectId);
        Object.assign(allProjects[idx], projectChanges);
        return { allProjects };
      });
    });
  }

  noPermissionsAlert = ev => {
    ev.preventDefault();
    // TODO: Beautiful modal.
    alert("You don't have access to this project. Ask the administrator to add you.")
  }

  render(){
    return (
      <div className="padded-container">
        <Container fluid>
          <Row>
            <Col>
              <div className='mb-2'>
                <h3 className='float-left'>All projects</h3>
                {this.state.company && this.state.company.projectPermission ?
                <ProjectAdd className='float-md-right mb-2' appendNewlyAddedProject={this.appendNewlyAddedProject}/> : ''}
              </div>
              <Form>
                <Form.Control
                  ref={this.autoFocus}
                  value={this.state.textFilter}
                  placeholder="Find a project"
                  type="text"
                  onChange={this.onChangeTextFilter}/>
              </Form>

              {this.state.textFilter !== '' ? (
              <div className='mt-2'>Projects found: {this.state.filteredProjects.length}</div>
              ) : ''}
            </Col>
          </Row>
          <Row>
            <Col>
              {this.state.allProjects && this.state.company ? (
                this.state.filteredProjects.map((proj, i) => (
                  <div key={i} className='project-list-item'>
                    {/* TODO: It's technically impossible for now to mark projects as favorite when
                    the user is not participating in them (because the row doesn't exist) */}
                    {proj.access ? (
                      <div className='project-list-item-toolbar'>
                        <button onClick={() => { this.toggleFavoriteProject(proj.id); }} className={'project-list-item-star' + (proj.favorite ? ' project-list-item-star-marked' : '')}>
                          <FontAwesomeIcon icon={faStar}/>
                        </button>
                      </div>
                    ) : ''}

                    {proj.access ? '' : <div className='project-list-item-lock'><FontAwesomeIcon icon={faLock}/></div>}

                    <Link className='primary-link'
                      to={`./project/${proj.id}/summary`}
                      onClick={proj.access ? ()=>{} : this.noPermissionsAlert}>
                      {proj.name}
                    </Link>

                    <div className='project-list-item-description mb-4'>
                      {proj.description ? proj.description : <i>No description.</i>}
                    </div>

                    <div className='project-list-item-information'>
                      <p>Created on {Util.formatDate(proj.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : <Spinner/>}

            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withRouter(ProjectList);
