import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import {
  Link
} from "react-router-dom";
import CompanyService from '../services/CompanyService';
import { URL_COMPANY_PREFIX } from '../Constants';
import './Sidebar.scss';

class Sidebar extends React.Component{

  constructor() {
    super();
    this.state = {
      companies: []
    }
  }

  componentDidMount() {
    CompanyService.list()
    .then(data => {
      this.setState({
        companies: data
      });
    });
  }

  render(){
    return (
      <nav id="sidebar">
        <div id="sidebar-header">
          <span id="sidebar-header-text">Daijob HGT</span>
        </div>

        <div className="sidebar-non-scrollable-container">
          {this.state.companies.map((company, i) => (
            <div className="sidebar-link-item">
              <Link to={`/${URL_COMPANY_PREFIX}/${company.url}/projects`}>
                {company.name}
              </Link>
            </div>
          ))}
        </div>

        <div id="sidebar-scrollable-container">
          {[1,2,3,4,5,6,7].map(i => (
            <div className="sidebar-link-item" key={i}>
              <a href="localhost">Scroll link {i}</a>
            </div>
          ))}
        </div>

        <div className="sidebar-non-scrollable-container" id="sidebar-lower-non-scrollable-container">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div className="sidebar-link-item" key={i}>
              <a href="localhost">Fixed option {i}</a>
            </div>
          ))}
        </div>

        <div id="sidebar-footer-container">
          <div id="sidebar-footer-user-icon">
            <img src="/placeholder.png"/>
          </div>
          <div id="sidebar-footer-user-name">
            Felo Vilches
          </div>
          <div id="sidebar-footer-config-button">
            <button><FontAwesomeIcon icon={faCog} /></button>
          </div>
        </div>
      </nav>
    );
  }
}

export default Sidebar;
