import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './ViewBreadcrumb.scss';

/*
TODO: Make it so that when clicking outside the component, the dialog closes.
The reason why this is important is because, let's say I make the readme also editable like this,
then this could happen:
1. User opens form to edit name.
2. User edits readme.
3. Changes modify the state of parent, making it modify the props of this one.
4. Those prop changes would make it reset the opened form (both input value and editing state)

So, this might look a bit glitchy.
If it doesn't look so glitchy, then it might not be necessary to fix. It might be low-priority.
*/

export default class ViewBreadcrumb extends React.Component{
  constructor(){
    super();
    this.viewNameInputRef = null;
    this.state = {
      editing: false,
      savingLoading: false,
      viewNameInput: '',
      viewName: ''
    };
  }

  static getDerivedStateFromProps(props, state){
    if(state.viewName === props.viewName){
      return {};
    }
    return {
      viewName: props.viewName,
      viewNameInput: props.viewName,
      editing: false,
      savingLoading: false
    };
  }

  saveViewNameChanges = ev => {
    ev.preventDefault();
    if(this.state.viewName.trim() === this.state.viewNameInput.trim()){
      return this.setState({
        editing: false
      });
    }
    this.setState({
      editing: false,
      savingLoading: true
    });
    this.props.editViewName(this.state.viewNameInput);
  }

  toggleEditing = () => {
    this.setState(state => {
      let currentValue = state.editing;
      return {
        viewNameInput: state.viewName,
        editing: !currentValue
      };
    }, () => {
      if(this.state.editing){
        this.viewNameInputRef.focus();
      }
    });
  }

  onChangeViewNameInput = ev => {
    this.setState({
      viewNameInput: ev.target.value
    });
  }

  render(){
    return(
      <div>
        {this.state.editing ? (
          <form onSubmit={this.saveViewNameChanges}>
            <input value={this.state.viewNameInput} onChange={this.onChangeViewNameInput} ref={ele => this.viewNameInputRef = ele}></input>
            <button className='generic-small-btn' type='submit'><FontAwesomeIcon icon={faCheck}/></button>  
            <button className='generic-small-btn' type='button' onClick={this.toggleEditing}><FontAwesomeIcon icon={faTimes}/></button>
          </form>
        ) : (
          <span>
            <Link to={`../../../projects`}>{this.props.companyId}</Link>
            <span className='view-breadcrumb-slash'>/</span>
            <Link to={`../views`}>{this.props.projectName}</Link>
            <span className='view-breadcrumb-slash'>/</span>
            <b>{this.props.viewName}</b>
            
            {this.props.developPermission ? (
              this.state.savingLoading ? '(Saving...)' :
              <button className='generic-small-btn' onClick={this.toggleEditing}><FontAwesomeIcon icon={faEdit}/></button>
            ) : ''}
          </span>
        )}
      </div>
    );
  }
}
