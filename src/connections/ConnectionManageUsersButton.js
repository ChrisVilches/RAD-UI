import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import CustomTooltip from '../decoration/CustomTooltip';
import GenericTable from '../GenericTable';
import Modal from 'react-bootstrap/Modal';
import Util from '../Util';
import ConnectionService from '../services/ConnectionService';
import Toggle from 'react-toggle';
import UserNameIcon from '../users/UserIconName';

class ConnectionManageUsersButton extends React.Component{
  constructor(){
    super();
    this.state = {
      visible: false,
      loading: false,
      addRemoveInProgress: false,
      users: {}
    };
  }

  toggle = value => {
    this.setState(state => {
      state.visible = value;
      state.loading = value;
      state.addRemoveInProgress = false;

      if(!value){
        state.users = {};
      }

      return state;
    });
  }

  decorateUserObject = user => {
    return <UserNameIcon id={user.id} email={user.email}/>;
  }

  decorateCanUseConnection = (bool, row) => {
    if(typeof bool !== 'boolean'){
      return bool;
    }
    let userId = row.user.id;
    return <Toggle
      onChange={() => { this.handleConnectionAllowUserChange(userId, !row.canUseConnection) }}
      icons={false}
      checked={bool}/>
  }

  handleConnectionAllowUserChange = (userId, allowUse = null) => {
    if(allowUse === null){
      throw new Error('Specify whether to add or remove user from connection.');
    };
    if(this.state.addRemoveInProgress){
      console.warn("Add/remove user to connection operation was blocked, due to another similar operation in progress.");
      return;
    }
    this.setState(state => {
      state.addRemoveInProgress = true;
      return state;
    });

    let connectionId = this.props.connection.id;
    let method = allowUse ? ConnectionService.addUser : ConnectionService.deleteUser;
    method(connectionId, userId)
    .then(() => {
      // Update the already fetched table.
      this.setState(state => {
        state.addRemoveInProgress = false;
        let row = state.users.rows.find(row => row.user.id === userId);
        if(row){
          row.canUseConnection = allowUse;
        }
        return state;
      });
    });
  }

  fetchUsers = opts => {
    let backendParams = {
      p: opts.page,
      perPage: opts.rowsPerPage,
      sortBy: opts.sortOrder.name,
      sortByDir: opts.sortOrder.direction,
      keyword: opts.searchText
    }

    Util.removeEmptyValues(backendParams);
    let connectionId = this.props.connection.id;
    return ConnectionService.users(connectionId, backendParams);
  }

  usersFetchedHandler = res => {
    this.setState(state => {
      state.loading = false;
      state.users = {
        columns: res.columns,
        rows: res.data,
        totalCount: res.total
      }
      console.log(state.users)

      return state;
    });
  }

  render(){
    return(
      <div>
        <CustomTooltip placement="bottom" text="Add user so they can use this connection.">
          <button className='small-text' onClick={() => { this.toggle(true) }}><FontAwesomeIcon icon={faUserPlus}/></button>
        </CustomTooltip>

        <Modal
          show={this.state.visible}
          onHide={() => this.toggle(false)}
          aria-labelledby="example-modal-sizes-title-sm"
          >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-sm">
              Allow user to use connection
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.loading ? 'Loading...' : ''}

            {/*
            TODO: The reason I cannot put the table inside the triple operator above,
            is because the data fetching occurs only when the generic table is rendered,
            so I have to render it along with the "loading" text. This can be solved in
            many ways, so find the best one. Perhaps pass a 'loading' props, and make it
            render something inside, in a way that data is not seen. Also this prop
            would replace the 'Sorry, no matches' for a 'loading...' text, and only when
            it stops loading, if there are no rows, it should show the 'no matches' message.
            */}

            <GenericTable
            fetchData={this.fetchUsers}
            dataFetchedHandler={this.usersFetchedHandler}
            columns={this.state.users.columns}
            data={this.state.users.rows}
            totalCount={this.state.users.totalCount}
            columnDecorators={{ user: this.decorateUserObject, canUseConnection: this.decorateCanUseConnection }}
            />
            
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ConnectionManageUsersButton;
