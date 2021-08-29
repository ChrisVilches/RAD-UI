import React from 'react';
import CustomTooltip from './../decoration/CustomTooltip';
import ErrorMessages from './ErrorMessages';
import './Element.scss';

export default class OptionInput extends React.Component{

  constructor(){
    super();

    this.state = {
      selectedOptionIndex: 0,
      checkedBoxes: []
    };
  }


  componentDidMount(){
    this.props.setInputValue(this.props.variableName, this.state.selectedOptionIndex);

    // When mounting for the first time, if it's required, then set the option as
    // value 0 (first option of the actual selectable options that are in the database
    // not the UI component),
    // and if it's not required, then make the null (empty) one be selected.
    this.setState({
      selectedOptionIndex: this.props.params.required ? 0 : '',
      checkedBoxes: new Array(this.props.params.options.length).fill(false)
    });
  }

  selectedOptionsHaveChangedSendData = () => {
    // Convert to null before sending if it's an empty string
    let value;
    switch(this.props.params.componentType){

      default:
      value = null;
      break;

      case "checkbox":
      value = this.state.checkedBoxes;
      // Extract indexes that have a "true" value
      value = value
        .map((x, i) => x ? i : null)
        .filter(e => typeof e === "number")
      break;

      case "pulldown":
      value = this.state.selectedOptionIndex;
      if(typeof value === "string" && value === ""){
        value = null;
      }
      break;
    }

    this.props.setInputValue(this.props.variableName, value);

  }

  handlePulldownChange = (ev) => {
    ev.persist();

    let value = ev.target.value;
    // Treat empty string as null. Anything else as number.
    value = value === "" ? "" : Number(value);

    this.setState(state => {
      return {
        selectedOptionIndex: value
      };
    }, this.selectedOptionsHaveChangedSendData);
  }

  handleCheckboxChange = (ev) => {
    ev.persist();
    this.setState(state => {
      let index = ev.target.value;
      state.checkedBoxes[index] = !state.checkedBoxes[index];
      return {
        checkedBoxes: state.checkedBoxes
      };
    }, this.selectedOptionsHaveChangedSendData);
  }

  checkbox(){
    return (
      <div>
      {this.props.params.options.map((opt, i) => (
        <div key={i}>
          <label>{opt.label}</label>
          <input
          onChange={this.handleCheckboxChange}
          checked={this.state.checkedBoxes[i] || false}
          value={i}
          type="checkbox"/>
        </div>
      ))}
      </div>
    );
  }

  pulldown(){
    // TODO This is probably not yet implemented 100%
    return (
      <select className="form-control" onChange={this.handlePulldownChange} value={this.state.selectedOptionIndex}>
      {
        // Render the null option if it's not required.
        this.props.params.required ?
        <option value="">ー</option> : ""
      }
      {this.props.params.options.map((opt, i) => (
        <option key={i} value={i}>
          {opt.label}
        </option>
      ))}
      </select>
    );
  }

  radio(){
    return "unsupported yet";
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

      {this.props.params.options != null && this.props.params.componentType === "pulldown" ? this.pulldown() : ""}
      {this.props.params.options != null && this.props.params.componentType === "checkbox" ? this.checkbox() : ""}
      {this.props.params.options != null && this.props.params.componentType === "radio" ? this.radio() : ""}

      {this.props.errors ? (
        <ErrorMessages messages={this.props.errors.messages}/>
      ) : ""}
      </div>
    );
  }
}
