import React from 'react';
import Container from './Container';

export default class Form extends React.Component{
  constructor(){
    super();
    this.state = {
      inputValues: []
    };
  }

  setInputValue = (variablePath, value) => {
    this.setState(state => {
      // The code is a bit uncomfortable, but it's supposed to add data like this:
      // [{ path: ['container', 'my-input'], value: 3 }, { path: [...], value: 5}, { etc }]
      // but everytime a different value comes, it has to replace the one that has the
      // same path (that's why it's a bit complex. It could be easier with a map and then
      // just replace the key using the path, but I want to always keep the same data format,
      // without converting it many times.)
      //
      // TODO: Actually it's not even that complex so at least edit this comment and make it simpler.
      // Just explain briefly what it does.
      let inputValues = state.inputValues;
      let dottedPath = variablePath.join('.');
      let param = inputValues.find(param => param.path.join('.') === dottedPath);

      if(param){
        param.value = value;
      } else {
        inputValues.push({
          path: variablePath,
          value: value
        });
      }
      return { inputValues };
    }, () => {
      if(typeof this.props.getData === 'function'){
        this.props.getData(this.state.inputValues);
      }
    });
  }

  render(){
    return(
      <Container root={true} setInputValue={this.setInputValue} {...this.props}/>
    );
  }
}
