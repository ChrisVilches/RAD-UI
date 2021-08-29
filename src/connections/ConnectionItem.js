import React from 'react';
import ConnectionTitle from './ConnectionTitle';
import ConnectionInformation from './ConnectionInformation';
import CustomTooltip from '../decoration/CustomTooltip';
import Col from 'react-bootstrap/Col';
import ConnectionRemoveButton from './ConnectionRemoveButton';
import ConnectionManageUsersButton from './ConnectionManageUsersButton';
import ConnectionConfigButton from './ConnectionConfigButton';

const LOGO_MAP = {
  mysql: 'icon-mysql-alt',
  postgres: 'icon-postgres'
};

// TODO: This code is repeated in another component.
const DB_LABELS = {
  mysql: 'MySQL',
  postgres: 'PostgreSQL'
}

class ConnectionItem extends React.Component{
  constructor(){
    super();
    this.state = {
    };
  }

  render(){
    return(
      <Col lg={6} xl={4} className='grid-square-widget'>
        <div className='grid-square-widget-content connection-item-content'>
          <div className="connection-item-top">
              <ConnectionTitle className='connection-item-content-title' color={this.props.connection.color} name={this.props.connection.name}></ConnectionTitle>

            <div className="connection-item-content-toolbar">
              <ConnectionManageUsersButton connection={this.props.connection} project={this.props.project} companyId={this.props.companyId}/>
              <ConnectionConfigButton connection={this.props.connection} project={this.props.project} companyId={this.props.companyId} onConnectionUpserted={this.props.onConnectionUpserted}/>
              <ConnectionRemoveButton connection={this.props.connection} project={this.props.project} companyId={this.props.companyId} onConnectionRemoved={this.props.onConnectionRemoved}/>
            </div>
          </div>

          <div className='connection-item-content-description-container'>
            <div className='connection-item-content-description-logo-container'>
              <CustomTooltip placement="bottom" text={DB_LABELS[this.props.connection.dbType]}>
                <i className={`connection-database-logo ${LOGO_MAP[this.props.connection.dbType]}`}/>
              </CustomTooltip>
            </div>
            <div md={10} className='connection-item-content-description-text small-text'>
              {this.props.connection.description || <i>No description</i>}
            </div>
          </div>

          <ConnectionInformation className='connection-item-content-footer-container small-text' {...this.props.connection}/>
        </div>
      </Col>
    );
  }
}

export default ConnectionItem;
