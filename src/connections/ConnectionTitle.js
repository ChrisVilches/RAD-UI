import React from 'react';
import { COLOR_MAP } from './ConnectionForm';

const DEFAULT_COLOR = 'white';

const ConnectionTitle = props => {
  const backgroundColor = COLOR_MAP[props.color || DEFAULT_COLOR];
  return (
    <div className={`${props.className || ''}`}>
      <div className='connection-label' style={{ backgroundColor }}/>
      {props.name}
    </div>
  );
}

export default ConnectionTitle;
