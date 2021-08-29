import React from 'react';
import './Layout.scss';
import '../scss/bootstrap-override.scss';
import './pc-layout-main-structure.scss';
import View from '../view/View';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Project from '../project/Project';
import ProjectList from '../projectlist/ProjectList';
import ViewEdit from '../form-builder/ViewEdit';
import QueryEdit from '../form-builder/QueryEdit';
import { URL_COMPANY_PREFIX } from '../Constants';
import { ToastContainer } from 'react-toastify';
import Error404 from './Error404';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

class Home extends React.Component {
  render() {
    return (
      <div>
        Home page.
      </div>
    );
  }
}

class Layout extends React.Component {
  /*
  * Main page which contains the router and nav menu.
  */
  render() {
    return (
      <Router>
        <ToastContainer position='bottom-right' hideProgressBar={true}/>
        <div className='wrLayouter'>
          <Sidebar/>
          <Topbar/>
          <div id='content'>
            <Switch>
              <Route exact path={`/${URL_COMPANY_PREFIX}/:companyId/project/:projectId/view/:viewId/query/:queryId/edit`}>
                <QueryEdit />
              </Route>
              <Route exact path={`/${URL_COMPANY_PREFIX}/:companyId/project/:projectId/view/:viewId/edit`}>
                <ViewEdit />
              </Route>
              <Route exact path={`/${URL_COMPANY_PREFIX}/:companyId/project/:projectId/view/:viewId`}>
                <View />
              </Route>
              <Route exact path={`/${URL_COMPANY_PREFIX}/:companyId/projects`}>
                <ProjectList />
              </Route>
              <Route exact path={`/${URL_COMPANY_PREFIX}/:companyId/project/:projectId/:tabName`}>
                <Project />
              </Route>
              <Route exact path='/'>
                <Home />
              </Route>
              <Route path='*'>
                <Error404/>
              </Route>
            </Switch>
          </div>
          <Footer/>
        </div>
      </Router>
    );
  }
}

export default Layout;
