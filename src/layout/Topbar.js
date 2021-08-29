import React from 'react';
import { faBell, faTree, faInbox } from '@fortawesome/free-solid-svg-icons';
import TopbarButton from './TopbarButton';

export default function Topbar(){
  return (
    <nav id="navbar" className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <button className="btn btn-dark d-inline-block d-lg-none ml-auto" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <i className="fas fa-align-justify"></i>
        </button>

        <TopbarButton icon={faBell} highlight={true}/>
        <TopbarButton icon={faTree} highlight={false}/>
        <TopbarButton icon={faInbox} highlight={true}/>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="nav navbar-nav ml-auto">
            <li className="nav-item">
              <a className="nav-link" href="localhost">Tips</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="localhost">Documentation</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
