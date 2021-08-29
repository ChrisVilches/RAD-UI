import React from 'react';
import CustomTooltip from './../decoration/CustomTooltip';
import ErrorMessages from './ErrorMessages';
import './Element.scss';

export default class TextInput extends React.Component{

  constructor(){
    super();

    this.state = {
      multiline: false,
      valueInput: ""
    };
  }

  static getDerivedStateFromProps(props, state){
    return {
      multiline: props.multiline
    };
  }

  componentDidMount(){
    this.props.setInputValue(this.props.variableName, this.state.valueInput);
  }

  handleTextChange = (ev) => {
    ev.persist();
    this.setState(state => {
      return {
        valueInput: ev.target.value
      };
    }, () => {
      this.props.setInputValue(this.props.variableName, this.state.valueInput);
    });
  }

  render(){
    return(
      <div className="Element">

        <div className="element-label">
        {this.props.label}
        </div>

      {
        typeof this.props.description === "string" ?
        <CustomTooltip text={this.props.description}/> :
        ""
      }

      {
        this.state.multiline ?
        <input value={this.state.inputValue} onChange={this.handleTextChange}/> :
        <textarea className="form-control" onChange={this.handleTextChange} placeholder={this.props.params.placeholder}>{this.state.inputValue}</textarea>
      }

      {this.props.errors ? (
        <ErrorMessages messages={this.props.errors.messages}/>
      ) : ""}
      </div>
    );
  }
}
