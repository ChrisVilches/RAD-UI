import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

class QueryMenu extends React.Component{
  editQueryLink(){
    let viewId = this.props.query.viewId;
    let queryId = this.props.query.id;
    return `${viewId}/query/${queryId}/edit`;
  }

  render(){
    return (
      <div className="query-edit-toolbar">
        <div className="query-edit-toolbar-content">

          <Link className="query-edit-toolbar-btn" to={this.editQueryLink()}>
            <FontAwesomeIcon icon={faEdit}/>
          </Link>

          <a href="#" className="query-edit-toolbar-btn" onClick={() => { this.props.deleteQuery(this.props.query.id) }}>
            <FontAwesomeIcon icon={faTimes}/>
          </a>
        </div>
      </div>
    );
  }
}

export default QueryMenu;
