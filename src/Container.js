import React from 'react';
import NumericInput from './inputs/NumericInput';
import TextInput from './inputs/TextInput';
import OptionInput from './inputs/OptionInput';
import BSContainer from 'react-bootstrap/Container';
import './Container.scss';

/*
TODO: Some explanation comments may be outdated.
*/

export default class Container extends React.Component{

  constructor(){
    super();
    this.state = {
      elements: [],
      active: true
    };
  }

  static getDerivedStateFromProps(props, state){
    return {
      elements: props.elements || [],
      active: typeof props.active == "boolean" ? props.active : true
    };
  }

  // Path is relative to container. This method is passed to elements, and when they call
  // it, in the argument they just need to enter the path they know only (only
  // the subtree from this container onwards, since they don't know parent variable names)
  // This method will at the end send to its the parent the path to the modified
  // variable and its new value, along with the query reference (or main container
  // if that's the case).
  setInputValue = (relativeVariablePath, value) => {
    if(typeof relativeVariablePath === "string"){
      relativeVariablePath = [relativeVariablePath];
    }

    let parentVariableName = this.props.variableName;
    let path;

    if(typeof parentVariableName === "string"){
      // Preppend parent variable name to build full path.
      path = [parentVariableName].concat(relativeVariablePath);
    } else {
      // It's in the base container
      path = relativeVariablePath;
    }
    this.props.setInputValue(path, value);
  }

  render(){

    if(this.state.elements.length === 0){
      return null;
    }

    let toHtml = (element) => {
      switch(element.elementableType){
        default:
        throw new Error("Incorrect type");

        case "NumericInput":
        return <NumericInput {...element} setInputValue={this.setInputValue} errors={this.props.getErrorsInput(element.id)}/>;

        case "OptionInput":
        return <OptionInput {...element} setInputValue={this.setInputValue} errors={this.props.getErrorsInput(element.id)}/>;

        case "TextInput":
        return <TextInput {...element} setInputValue={this.setInputValue} errors={this.props.getErrorsInput(element.id)}/>;

        case "Container":
        return <Container root={false} variableName={element.variableName} elements={element.elements} active={element.active} setInputValue={this.setInputValue} getErrorsInput={this.props.getErrorsInput}/>;
      }
    };

    return(
      <BSContainer className={"Container mb-4 " + (this.props.root ? "root-container" : "")} style={{display: this.state.active ? "" : "none"}}>
        {this.state.elements.map((element, i) => (
          <div key={i}>
          {toHtml(element)}
          </div>
        ))}

        {typeof this.props.children === "undefined" ? "" : (
          <div className="mb-2">
          {this.props.children}
          </div>
        )}
      </BSContainer>
    );
  }
}
