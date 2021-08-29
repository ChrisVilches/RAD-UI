import React from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faTable, faClock, faPlay } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import CustomTooltip from '../decoration/CustomTooltip';
import Util from '../Util';

/*
TODO: Add this (it needs to be a Class component).

componentDidMount(){

    // TODO: Move this to the Information component (footer).
    this.initializeUpdateInterval();
  }

  componentWillUnmount(){
    clearInterval(this.updateInterval);
  }

  // Update the 'x minutes ago'. But it doesn't need to be precise.
  // Twice per minute is fine.
  initializeUpdateInterval = () => {
    let everySeconds = 28;
    this.updateInterval = setInterval(() => {
      this.setState({
        rand: Math.random()
      });
    }, everySeconds * 1000);
  }
*/

const ConnectionInformation = props => {
  let { lastExecutedAt, usersCount, queriesCount, usedTimes } = props;
  usersCount |= 0;
  queriesCount |= 0;
  usedTimes |= 0;
  return (
    <div className={props.className || ''}>
      <div className='connection-item-content-footer-info'>
        <CustomTooltip placement="bottom" text={`This connection can be used by ${usersCount} users.`}>
          <FontAwesomeIcon icon={faUserFriends}/>
          <span>{usersCount}</span>
        </CustomTooltip>

        <CustomTooltip placement="bottom" text={`This connection is being used in ${queriesCount} queries.`}>
          <FontAwesomeIcon icon={faTable}/>
          <span>{queriesCount}</span>
        </CustomTooltip>

        <CustomTooltip placement="bottom" text={usedTimes === 0 ? 'Never used' : `This connection has been used ${usedTimes} time(s).`}>
          <FontAwesomeIcon icon={faPlay}/>
          <span>{usedTimes}</span>
        </CustomTooltip>
      </div>

      {/*
      TODO
      These numbers are different and perhaps it'd be good
      to put both separately.
      Being used in X queries. Being used in Y views.
      */}

      {lastExecutedAt ? (
        <div className='connection-item-content-footer-time-ago'>
          {/* TODO: Fix this. It won't update automatically.
          Perhaps simply a setInterval that triggers a re-render (by just modifying some this.state property)
          will be enough. */}
          {/* TODO: Implement a 'see activity' link which links to the Activity tab with a filter by connection ID (this filter is not implemented) */}
          <CustomTooltip placement="bottom" text={<span>Date of last execution with this connection:<br/>{Util.formatDate(lastExecutedAt)}</span>}>
            <FontAwesomeIcon icon={faClock}/>
            <span>
              <Link to='/activity' onClick={() => { alert('Not implemented yet'); }}>
                {moment(lastExecutedAt).fromNow()}
              </Link>
            </span>
          </CustomTooltip>
        </div>
      ) : ''}
    </div>
  );
}

export default ConnectionInformation;
