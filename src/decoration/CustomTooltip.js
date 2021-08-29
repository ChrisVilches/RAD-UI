import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const tooltip = text => (
  <Tooltip id='tooltip'>
  {text}
  </Tooltip>
);

export default class CustomTooltip extends React.Component {
  render(){
    let placement = this.props.placement ? this.props.placement : 'right';
    let defaultContent = <FontAwesomeIcon icon={faQuestionCircle}/>;
    let content = typeof this.props.children === 'undefined' ? defaultContent : this.props.children;

    return (
      <OverlayTrigger overlay={tooltip(this.props.text)} placement={placement} className={this.props.className}>
        <div>{content}</div>
      </OverlayTrigger>
    );
  }
}
