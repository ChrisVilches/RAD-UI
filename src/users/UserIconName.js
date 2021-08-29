import React from 'react';
import './UserIconName.scss';
import CustomTooltip from '../decoration/CustomTooltip';
import Util from '../Util';
import moment from 'moment';

const DefaultUserIcon = props => {
  // If name exists and has letters, use that. Else, use a space (and that space will be used as first letter).
  const name = typeof props.name === 'string' && props.name.length > 0 ? props.name : ' ';
  const firstLetter = name[0].toUpperCase();

  // Make the color change every week.
  const week = moment().format('W');

  // Has to be counted manually from the CSS (how many classes with the 'default-user-icon-color-' prefix exist).
  // If the class doesn't exist, a default color will be used. However it should exist.
  // TODO: Can this be done automatically?
  const colorCount = 7;

  const colorIdx = Math.abs(Util.hashString(props.name + week)) % colorCount;

  return (
    <div className={`default-user-icon default-user-icon-color-${colorIdx}`}>
      <span>{firstLetter}</span>
    </div>
  );
}

const UserIconName = props => {
  // TODO: Implement actual avatar.
  let Icon = <span></span>;
  if(!props.icon){
    Icon = <DefaultUserIcon name={props.email}/>;
  }

  // TODO: If props.id is available, create a link or something like that. If not, then don't.
  return (
    <CustomTooltip text={props.email} placement='bottom'>
      <div className='default-user-icon-container'>
        {Icon}<span className='default-user-icon-name'>{props.email}</span>
      </div>
    </CustomTooltip>
  );
}

export default UserIconName;
