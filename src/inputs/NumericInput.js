import React from 'react';
import CustomTooltip from './../decoration/CustomTooltip';
import ErrorMessages from './ErrorMessages';
import './Element.scss';

export default class NumericInput extends React.Component{

  constructor(){
    super();

    this.state = {
      valueInput: null // Cannot be empty string, because it'll be picked up as a string in the server (and become invalid).
    };
  }

  static getDerivedStateFromProps(props, state){
    return {};
  }

  componentDidMount(){
    this.props.setInputValue(this.props.variableName, this.state.valueInput);
  }

  handleNumberChange = (ev) => {
    ev.persist();
    this.setState(state => {
      return {
        valueInput: ev.target.value
      };
    }, () => {
      let value = this.state.valueInput;
      if(value.trim() === ""){
        value = null;
      } else {
        value = Number(value);
      }
      this.props.setInputValue(this.props.variableName, value);
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

        <input className="form-control"
        type="number"
        value={this.state.inputValue}
        placeholder={this.props.params.placeholder}
        onChange={this.handleNumberChange}/>

        {this.props.errors ? (
          <ErrorMessages messages={this.props.errors.messages}/>
        ) : ""}
      </div>
    );
  }
}
