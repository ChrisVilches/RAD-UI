import React from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import CustomTooltip from '../decoration/CustomTooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConnectionService from '../services/ConnectionService';

class ConnectionRemoveButton extends React.Component{
  constructor(){
    super();
    this.state = {};
  }

  deleteConnection = connectionId => {
    if(window.confirm('Delete?')){
      ConnectionService.delete(connectionId)
      .then(res => {
        this.props.onConnectionRemoved(res.connectionId);
      });
    }
  }

  render(){
    return(
      <div>
        <CustomTooltip placement="bottom" text="Remove connection.">
          <button className='small-text' onClick={() => { this.deleteConnection(this.props.connection.id) }}><FontAwesomeIcon icon={faTimes}/></button>
        </CustomTooltip>
      </div>
    );
  }

}

export default ConnectionRemoveButton;
