import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartBar, faCog } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import './ProjectMenu.scss';

const ProjectMenu = props => {
  return(
    <div id="project-menu-wrapper">
    <div id="project-menu">
      {/*
        TODO: The 'go back to projects' button kind of doesn't fit here so put it
        somewhere else. Perhaps in the top bar.

        I think the top bar would be cool as a breadcrumb, because currently there's nothing there.
      */}
      <div className='project-menu-left-portion'>
        <div className='project-menu-item'>
          <Link to={`../../projects`}>
            <FontAwesomeIcon icon={faArrowLeft}/>&nbsp;
            Other projects
          </Link>
        </div>
        <div className={"project-menu-item " + (props.tabName === "participants" ? "active-tab" : "")}>
          <Link to="./participants">Participants <div className="number-circle">{props.participantsCount}</div></Link>
        </div>
        <div className={"project-menu-item " + (props.tabName === "views" ? "active-tab" : "")}>
          <Link to="./views">Views <div className="number-circle">{props.viewsCount}</div></Link>
        </div>
        <div className={"project-menu-item " + (props.tabName === "connections" ? "active-tab" : "")}>
          <Link to="./connections">Connections <div className="number-circle">{props.connectionsCount}</div></Link>
        </div>
        <div className={"project-menu-item " + (props.tabName === "activity" ? "active-tab" : "")}>
          <Link to="./activity">Activity</Link>
        </div>
      </div>

      <div className='project-menu-right-portion'>
        <div className={"project-menu-item " + (props.tabName === "summary" ? "active-tab" : "")}>
          <Link to="./summary"><FontAwesomeIcon icon={faChartBar}/></Link>
        </div>
        <div className={"project-menu-item " + (props.tabName === "settings" ? "active-tab" : "")}>
          <Link to="./settings"><FontAwesomeIcon icon={faCog}/></Link>
        </div>
      </div>
    </div></div>
  );
}

export default ProjectMenu;
