import React from 'react';
import ContainerBuilder from './ContainerBuilder';
import ComponentValidator from './ComponentValidator';
import QueryService from '../services/QueryService';
import ViewService from '../services/ViewService';

class IEditable extends React.Component {

  constructor(){
    super();
    this.state = {
      // Contains container data with the following format.
      // This data will be sent as is (plus case_conversion conversion)
      // to the backend.
      //
      // {
      //   elements: [
      //     {
      //       variableName:,
      //       elementableType:,
      //       label:,
      //       params: { min:, max: }
      //     }
      //   ]
      // }
      container: null,

      // The following contains data about the component the user
      // is currently focusing on.
      selectedElement: null
    };
  }

  isVariableNameRepeated = id => {

    // Items added during building are strings (e.g. new0)
    if(!(typeof id !== "number" || typeof id !== "string")){
      throw new Error("ID for checking repeated variable names must be a number or string.");
    }

    let traverse = node => {

      if(node.hasOwnProperty("elements") && node.elements.length > 0){
        let wantedElement = node.elements.find(e => e.id === id);
        if(wantedElement !== null && typeof wantedElement !== "undefined"){
          let varNam = wantedElement.variableName;
          let match = node.elements.filter(e => e.variableName.trim() === varNam);
          if(match.length > 1){
            return true;
          }
        }
      }

      for(let i in node.elements){
        let elem = node.elements[i];
        let ret = traverse(elem);
        if(ret){
          return true;
        }
      }
      return false;
    };

    return traverse(this.state.container);
  }

  getPathFor = id => {

    // Items added during building are strings (e.g. new0)
    if(!(typeof id !== "number" || typeof id !== "string")){
      throw new Error("ID for finding path must be a number or string.");
    }

    let traverse = node => {

      if(node.id === id){
        return node.variableName
      }

      for(let i in node.elements){
        let elem = node.elements[i];
        let ret = traverse(elem);
        if(ret !== false){
          return [node.variableName].concat(ret);
        }
      }
      return false;
    };

    let path = traverse(this.state.container);

    if(path === false || typeof path === "undefined"){
      return [];
    }

    path.shift();
    // Turn null or undefined into empty string.
    path = path.map(str => typeof str === "string" ? str : "");
    return path
  }

  // When user clicks a component, it's selected, so a popup/modal/etc editor
  // can be opened for that component.
  selectComponent = item => {
    console.assert(item.hasOwnProperty("variableName"));
    console.assert(item.hasOwnProperty("id"));
    this.setState({
      selectedElement: item
    });
  }

  // Its called from the form tree configuring component (ContainerBuilder), so the
  // data comes from there. Data form and meaning is commentated in the constructor,
  // near this.state = { container }
  updateContainer = elements => {

    this.setErrorFlags({ elements }, true);

    let newState = { container: { elements } };

    // Unselect item when it has been deleted.
    if(this.state.selectedElement !== null){
      let selectedNode = ContainerBuilder.getItem([this.state.container], this.state.selectedElement.id);
      if(selectedNode === null){ // The selected node has disappeared.
        newState.selectedElement = null;
      }
    }

    this.setState(newState);
  }

  // TODO: Not sure if these arguments are named correctly.
  // This class is abstract (or interface), and it can be used with both queries
  // and views, so it should have a generic name.
  saveChanges(type = null, dataObj, objId = null){
    if(!(type === 'view' || type === 'query')){
      throw new Error("Specify type of save. Values can be 'view' or 'query'.");
    }
    // Since the original container and the error structure have the same
    // structure (tree shape), both are iterated simultaneously.
    // Then this function will compare the position in the error structure
    // to the original and container to determine which ID has an error, and
    // then it will populate the ID error array defined outside.
    let traverse = (nodeFromContainer, nodeFromErrorStructure) => {

      // Verify both trees have the same shape.
      console.assert(nodeFromContainer !== null);
      console.assert(nodeFromErrorStructure !== null);
      if(nodeFromErrorStructure.hasOwnProperty("elements")){
        console.assert(nodeFromContainer.elements.length === nodeFromErrorStructure.elements.length);
      }

      if(nodeFromErrorStructure.error){
        nodeFromContainer.errorsFormBuild = { serverError: true };
      } else {
        nodeFromContainer.errorsFormBuild = {};
      }

      // Assert that errors are either empty or just the server error.
      // In other words, clean the previous ones.
      let errorKeys = Object.keys(nodeFromContainer.errorsFormBuild);
      console.assert(errorKeys.length === 0 || errorKeys.length === 1);
      if(errorKeys.length === 1){
        console.assert(errorKeys[0] === "serverError");
      }

      for(let i in nodeFromContainer.elements){
        traverse(
          nodeFromContainer.elements[i],
          nodeFromErrorStructure.elements[i]
        );
      }
    };

    // This is an structure that should be returned from the server.
    // It has the same SHAPE as the one the user is editing, and says
    // which nodes have errors. These errors are saved to the component state,
    // so that the user is informed about the existence of errors.
    // When the user clicks the "config" button for the node, it will be
    // validated at the moment of opening its element configuration panel,
    // and the actual error detail will be displayed.
    // TODO when the server side code is implemented, comment this but leave
    // an example of the data structure and comment it. Explain that this is
    // because some IDs are undefined (due to not being saved yet to the
    // database, so that's why the server has to return something else
    // to explain the user which nodes have errors, without using IDs)
    /*
    let errorStructure = {
      error: false,
      elements: [{
        error: false,
        elements: [
          { error: false },
          { error: true }
        ]
      }]
    }*/
    let fail = errorStructure => {
      this.setState(state => {
        traverse(state.container, errorStructure);
        return {
          container: state.container
        };
      });
    };

    let executableMethod = type === 'view' ? ViewService.update : QueryService.update
    executableMethod(dataObj, objId)
    .then(response => {
      console.log("IEditable savechanges. No errors.");
    })
    .catch(response => {
      console.log("Error when saving changes.")
    });
  }

  // Root node doesn't need to be validated.
  setErrorFlags = (node, rootContainer = false) => {
    if(!rootContainer){
      console.assert(node.hasOwnProperty("variableName"));
      console.assert(node.hasOwnProperty("label"));
      console.assert(node.hasOwnProperty("params"));
    }

    // If this doesn't go first, errors that a node sets for its children
    // will be overwritten and deleted.
    for(let i in node.elements){
      let ele = node.elements[i];
      this.setErrorFlags(ele, false);
    }

    if(rootContainer){
      // This is to avoid problems when validating the main container.
      node.variableName = "main-dummy-varname";
    }

    let errors = ComponentValidator.validate(node, rootContainer);
    node.errorsFormBuild = errors;

    if(errors.hasOwnProperty("repeatedChildrenVariableNames")){
      let repeatedIdx = errors.repeatedChildrenVariableNames;
      for(let i in repeatedIdx){
        let id = repeatedIdx[i];
        let elem = node.elements[id];
        if(!elem.hasOwnProperty("errorsFormBuild")){
          elem.errorsFormBuild = {};
        }
        elem.errorsFormBuild.variableNameUsed = true;
      }
    }

    // Assert that errors with FALSE value don't exist.

    let checkFalses = node => {
      for(let key in node.errorsFormBuild){
        console.assert(node.errorsFormBuild[key] !== false);
      }
      for(let i in node.elements){
        let elem = node.elements[i];
        checkFalses(elem);
      }
    }

    checkFalses(node);
  }

  // Data comes from ContainerSettings, TextInputSettings, etc components.
  // It contains the whole configuration for a component (max, min, multiline, placeholder, etc),
  // as well as an error (Boolean) flag, which says whether the form has errors or not.
  // In order to know which component was modified, the selectedElement.id is used.
  changeComponentConfiguration = componentConfiguration => {
    console.assert(componentConfiguration.hasOwnProperty("elementData"));
    console.assert(componentConfiguration.hasOwnProperty("elementableData"));

    this.setState(state => {

      let node = ContainerBuilder.getItem([state.container], this.state.selectedElement.id);

      node = Object.assign(node, componentConfiguration.elementData);
      if(node.hasOwnProperty("params")){
        node.params = Object.assign(node.params, componentConfiguration.elementableData);
      }

      this.setErrorFlags(state.container, true);

      return {
        container: state.container
      };
    });
  }
}

export default IEditable;
