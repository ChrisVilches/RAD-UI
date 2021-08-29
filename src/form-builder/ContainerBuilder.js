import React from 'react';
import Nestable from 'react-nestable';
import ComponentValidator from './ComponentValidator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

// TODO Everything changed, so comment again.
// TODO comment everything with detail.
// explain structure of tree data structures, etc.
export default class ContainerBuilder extends React.Component {

  constructor(){
    super();

    this.uniqueId = 0;

    this.state = {
      tree: null
    };
  }

  // Here the container builder sends updated container (same JSON structure
  // as the one that comes from the backend).
  notifyUpdatedContainerElements(elements = null){
    this.props.notifyUpdatedContainerElements(elements);
  }

  static getDerivedStateFromProps(props, state){
    return {
      tree: [{
        id: -1,
        elements: props.initElements
      }],
      nodesWithErrors: props.nodesWithErrors
    };
  }

  // This method creates a new node and updates the class-scoped uniqueId property,
  // so that every node has a new ID.
  createNode = (itemType = "Container") => {

    let acceptedTypes = ["Container", "TextInput", "NumericInput", "OptionInput"];
    if(!acceptedTypes.find(t => t === itemType)){
      throw new Error("Incorrect type when creating a new node: " + itemType);
    }

    let node = {
      id: `new${this.uniqueId++}`,
      variableName: "",
      label: "",
      elementableType: itemType,
      params: {}
    };

    if(itemType === "Container"){
      node.elements = [];
    }

    return node;
  }

  static getItem = (tree, nodeId) => {

    let traverse = node => {
      if(node.id === nodeId) return node;

      for(let i in node.elements){ // If it's not a container, will be skipped naturally.
        let child = node.elements[i];
        let found = traverse(child);
        if(found !== null) return found;
      }

      return null;
    }

    return traverse(tree[0]);
  }

  getItem = nodeId => {
    return ContainerBuilder.getItem(this.state.tree, nodeId);
  }

  static getParent = (tree, nodeId) => {

    let traverse = node => {
      if(node.elements && typeof node.elements.find(item => item.id === nodeId) !== "undefined") return node;

      for(let i in node.elements){ // If it's not a container, will be skipped naturally.
        let child = node.elements[i];
        let found = traverse(child);
        if(found !== null) return found;
      }

      return null;
    }

    return traverse(tree[0]);
  }

  // Gets parent of node
  getParent = nodeId => {
    return ContainerBuilder.getParent(this.state.tree, nodeId);
  }

  static addChild = (tree, nodeId, newNode) => {

    let errors = ComponentValidator.validate(newNode);
    newNode.errorsFormBuild = errors;

    // Is root
    if(nodeId === -1){
      tree[0].elements.push(newNode);
      return tree;
    }

    let parent = ContainerBuilder.getItem(tree, nodeId);
    parent.elements.push(newNode);
    return tree;
  }

  addChild = (nodeId, itemType) => {
    // itemType (String) = "Container", "NumericInput", etc
    let newNode = this.createNode(itemType);
    let newTree = ContainerBuilder.addChild(this.state.tree, nodeId, newNode);
    this.notifyUpdatedContainerElements(newTree[0].elements);
  }

  deleteNode = nodeId => {

    let parent = this.getParent(nodeId);
    if(parent === null){
      return;
    }

    let tree = this.state.tree;

    parent.elements = parent.elements.filter(item => item.id !== nodeId);

    this.notifyUpdatedContainerElements(tree[0].elements)
  }

  addChildClickHandler = item => {
    this.toggleNewElementModalVisibility(true);
    if(item !== null){
      this.selectComponent(item);
    } else {
      this.setState({
        selectedItem: null
      })
    }
  }

  selectComponentFromModal(componentClassName){
    let nodeId;
    if(this.state.selectedItem === null){
      nodeId = -1;
    } else {
      nodeId = this.state.selectedItem.id;
    }
    this.addChild(nodeId, componentClassName);
    this.toggleNewElementModalVisibility(false);
  }

  selectComponent = item => {
    this.props.selectComponent(item);
    this.setState({
      selectedItem: item
    });
  }

  renderItem = ({ item }) => {
    let renderByType = item => {
      let type = item.elementableType;
      switch(type){
        case "Container":
        return <div className='d-inline'>Container</div>;
        case "NumericInput":
        return <div className='d-inline'><input style={{ cursor: 'default' }} readOnly placeholder="Number Input"/></div>;
        case "TextInput":
        return <div className='d-inline'><input style={{ cursor: 'default' }} readOnly placeholder="Text Input"/></div>;
        case "OptionInput":
        return (
          <div className='d-inline'>
            <input type="radio"/> Option 1<br/>
            <input type="radio"/> Option 2<br/>
            <input type="radio"/> Option 3<br/>
          </div>
        );
        default:
        throw new Error("Incorrect type.");
      }
    };

    // TODO: Parent container's errors are not showing?

    return (
      <div onClick={() => { this.selectComponent(item) }}>
        {renderByType(item)}

        {
          item.elementableType === "Container" ? (
            <div className='d-inline'>
              <button className='generic-small-btn d-inline' onClick={() => { }}><FontAwesomeIcon icon={faCog}/></button>
              <button className='generic-small-btn d-inline' onClick={() => { this.addChildClickHandler(item) }}><FontAwesomeIcon icon={faPlus}/></button>
            </div>
          ) : ""
        }

        {
          item.hasOwnProperty("errorsFormBuild") && Object.keys(item.errorsFormBuild).length > 0 ?
          "⚠" : ""
        }

        {this.state.selectedItem && this.state.selectedItem.id === item.id ? (
          <button className='generic-small-btn d-inline danger-btn' onClick={() => { this.deleteNode(item.id) }}><FontAwesomeIcon icon={faTimes}/></button>
        ) : ''}
        
      </div>
    );
  };

  toggleNewElementModalVisibility = bool => {
    this.setState({
      newElementModalVisible: bool
    });
  }

  confirmChange = (draggedNode, parentNode) => {
    if(parentNode === null) return true;
    return parentNode.elementableType === "Container";
  }

  onChange = (elements, movedItem) => {
    this.notifyUpdatedContainerElements(elements);
  }


  render() {

    if(this.state.tree === null){
      return "読み込み中";
    }

    return (
      <div>
        <Nestable
            items={[...this.state.tree[0].elements]}
            renderItem={this.renderItem}
            confirmChange={this.confirmChange}
            onChange={this.onChange}
            childrenProp="elements"
        />

        <button className='generic-small-btn' onClick={() => { this.addChildClickHandler(null) }}><FontAwesomeIcon icon={faPlus}/></button>

        <Modal
          size="lg"
          show={this.state.newElementModalVisible}
          onHide={() => this.toggleNewElementModalVisibility(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Add new element
          </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button variant='secondary' onClick={() => { this.selectComponentFromModal('Container') }}>Container</Button>
            <Button variant='secondary' onClick={() => { this.selectComponentFromModal('NumericInput') }}>NumericInput</Button>
            <Button variant='secondary' onClick={() => { this.selectComponentFromModal('TextInput') }}>TextInput</Button>
            <Button variant='secondary' onClick={() => { this.selectComponentFromModal('OptionInput') }}>OptionInput</Button>
          </Modal.Body>
        </Modal>

      </div>
    );
  }
}
