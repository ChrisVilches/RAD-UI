import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './TopbarButton.scss';

export default function TopbarButton(props){
  return (
    <div className='Topbar-Button'>
      <button>
        {props.highlight ? (
          <div className='Topbar-Button-nested-dot'/>
        ) : ''}
        <FontAwesomeIcon icon={props.icon}/>
      </button>
    </div>
  );
}
