import React from 'react';
import ComponentValidator from './ComponentValidator';
import './ElementConfiguration.scss';

let Path = props => {

  return (
    <span>
      {props.path.map(str => str.length > 0 ? str : "unnamed").join(".")}
    </span>
  );

};

class ComponentSettings extends React.Component {
  constructor(){
    super();
    this.state = {};
  }

  processChanges = () => {
    throw new Error("Not implemented.");
  }

  // elementableParams has a hash of keys (param name) and its value is the default value.
  // Example:
  // multiline => required
  // placeholder => ""
  static getComponentFormProps(props, state, elementableParams = {}){

    console.assert(props.hasOwnProperty("item"));
    console.assert(props.item.hasOwnProperty("id"));

    if(props.item.id === state.itemId){
      return null;
    }

    let formFields = {
      errors: {},
      itemId: props.item.id,
      label: props.item.label || "",
      variableName: props.item.variableName || ""
    };

    // Set default values.
    if(props.item.hasOwnProperty("params")){
      for(let key in elementableParams){
        let defaultValue = elementableParams[key];
        if(defaultValue === null){
          throw new Error("Default value must be different from null.");
        }
        formFields[key] = props.item.params[key] || defaultValue;
      }
    } else {
      console.warn("Element doesn't have a 'params' field.");
      console.warn(props.item);
    }

    return formFields;
  }

  componentDidMount(){
    this.processChanges();
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if(prevState.itemId !== this.props.item.id){
      this.processChanges();
    }
  }
}

class ContainerSettings extends ComponentSettings {

  static getDerivedStateFromProps(props, state){
    return ComponentSettings.getComponentFormProps(props, state, { isActive: "" });
  }

  processChanges = () => {
    let state = this.state;

    let errors = ComponentValidator.validate({
      variableName: state.variableName,
      label: state.label,
      elementableType: "Container",
      params: state
    });

    this.setState({
      errors
    });

    let formChangeResults = {
      elementableData: {
        isActive: this.state.isActive
      },
      elementData: {
        label: this.state.label,
        variableName: this.state.variableName
      }
    };

    this.props.notifyChanges(formChangeResults);

  }

  onChangeLabel = e => { this.setState({ label: e.target.value }, this.processChanges); }
  onChangeIsActive = e => { this.setState({ isActive: e.target.value }, this.processChanges); }
  onChangeVariableName = e => { this.setState({ variableName: e.target.value }, this.processChanges); }

  render(){
    return (
      <div>
        <h2>Container</h2>

        {
          // TODO There are some error display errors here.
          // * The container should mention "there are repeated variables under this container",
          //   but it doesn't. Fix by implementing a similar method as "this.props.isVariableNameRepeated"
          // * (FIXED) The alert icon when there are repeated variable names under a container,
          //   should only appear if the variable names are not empty.

        }

        <div className="mb-4">
          <Path path={this.props.getPathFor(this.props.item.id)}/>
        </div>

        <div className="mb-4">
          Label<br/>
          <input value={this.state.label} onChange={this.onChangeLabel}/>
        </div>

        <div className="mb-4">
          Variable name<br/>
          <input value={this.state.variableName} onChange={this.onChangeVariableName}/>
          <div className="small-error-label">
            {this.state.errors.variableName ? "入力 this shit" : ""}
            {this.state.variableName && this.props.isVariableNameRepeated(this.props.item.id) ? "Already in use" : ""}
          </div>
        </div>

        <h3>Events</h3>
        <div className="mb-4">
          isActive<br/>
          <textarea value={this.state.isActive} onChange={this.onChangeIsActive}></textarea>
        </div>
      </div>
    );
  }
}

class NumericInputSettings extends ComponentSettings {

  constructor(){
    super();
    this.state = {
      excludedValuesText: ""
    };
  }

  static getDerivedStateFromProps(props, state){
    return ComponentSettings.getComponentFormProps(props, state, {
      required: false,
      numberSet: "decimal",
      min: "",
      max: "",
      placeholder: "",
      excludedValues: []
    });
  }

  processChanges = () => {
    let state = this.state;

    let errors = ComponentValidator.validate({
      variableName: state.variableName,
      label: state.label,
      elementableType: "NumericInput",
      params: state
    });

    this.setState({
      errors
    });

    // Notify updates to parent component.
    // Result should have errors,
    // Numeric fields converted to null instead of empty string "".

    let formChangeResults = {
      elementableData: {
        required: this.state.required,
        min: this.state.min,
        max: this.state.max,
        placeholder: this.state.placeholder,
        numberSet: this.state.numberSet,
        excludedValues: this.state.excludedValues
      },
      elementData: {
        label: this.state.label,
        variableName: this.state.variableName
      }
    };

    this.props.notifyChanges(formChangeResults);

  }

  onChangeLabel = e => { this.setState({ label: e.target.value }, this.processChanges); }
  onChangeVariableName = e => { this.setState({ variableName: e.target.value }, this.processChanges); }
  onChangeRequired = e => { this.setState({ required: e.target.checked }, this.processChanges); }
  onChangePlaceholder = e => { this.setState({ placeholder: e.target.value }, this.processChanges); }
  onChangeMin = e => {

    // This is so that the user can clear the input (make it empty).
    if(e.target.value.length === 0){
      return this.setState({ min: "" }, this.processChanges);
    }

    let v = Number(e.target.value);
    if(v < 0) return;
    this.setState({ min: v }, this.processChanges);
  }
  onChangeMax = e => {

    // This is so that the user can clear the input (make it empty).
    if(e.target.value.length === 0){
      return this.setState({ max: "" }, this.processChanges);
    }

    let v = Number(e.target.value);
    if(v <= 0) return;
    this.setState({ max: v }, this.processChanges);
  }
  onChangeNumberSet = e => {
    this.setState({
      numberSet: e.target.value
    }, this.processChanges);
  }
  onChangeExcludedValuesText = e => {
    function onlyUnique(value, index, self){
      return self.indexOf(value) === index;
    }
    let values = e.target.value.split(",").map(n => +n).sort().filter(onlyUnique);
    this.setState({
      excludedValuesText: e.target.value,
      excludedValues: values
    }, this.processChanges);
  }

  render(){
    return (
      <div>
        <h2>Numeric Input</h2>

        <div className="mb-4">
          <Path path={this.props.getPathFor(this.props.item.id)}/>
        </div>

        <div className="mb-4">
          Label<br/>
          <input value={this.state.label} onChange={this.onChangeLabel}/>
          <div className="small-error-label">
            {this.state.errors.label ? "入力 this shit" : ""}
          </div>
        </div>

        <div className="mb-4">
          Variable name<br/>
          <input value={this.state.variableName} onChange={this.onChangeVariableName}/>
          <div className="small-error-label">
            {this.state.errors.variableName ? "入力 this shit" : ""}
            {this.state.variableName && this.props.isVariableNameRepeated(this.props.item.id) ? "Already in use" : ""}
          </div>
        </div>

        <div className="mb-4">
          Required<br/>
          <input type="checkbox" checked={this.state.required} onChange={this.onChangeRequired}/>
        </div>

        <div className="mb-4">
          Number set<br/>
          <select value={this.state.numberSet} onChange={this.onChangeNumberSet}>
            <option value="decimal">Decimal</option>
            <option value="integer">Integer</option>
            <option value="binary">Binary</option>
          </select>
        </div>

        <div className="mb-4">
          Excluded values<br/>
          <input type="text" value={this.state.excludedValuesText} onChange={this.onChangeExcludedValuesText}/>
          Parsed values: {this.state.excludedValues.join(", ")}
        </div>

        <div className="mb-4">
          Placeholder<br/>
          <input value={this.state.placeholder} onChange={this.onChangePlaceholder}/>
        </div>

        <div className="mb-4">
          Range<br/>
          <input type="number" value={this.state.min} onChange={this.onChangeMin}/> -
          <input type="number" value={this.state.max} onChange={this.onChangeMax}/>
          <div className="small-error-label">
            {this.state.errors.min || this.state.errors.max ? "Set the range correctly" : ""}
          </div>
        </div>

      </div>
    );
  }
}

class TextInputSettings extends ComponentSettings {

  static getDerivedStateFromProps(props, state){
    return ComponentSettings.getComponentFormProps(props, state, {
      required: false,
      multiline: false,
      placeholder: "",
      min: "",
      max: "",
      regex: ""
    });
  }

  // This method should be executed after the form is changed.
  // Then, it will notify its parent with the changes produced (all form data),
  // including whether the form has errors.
  processChanges = () => {
    let state = this.state;

    let errors = ComponentValidator.validate({
      variableName: state.variableName,
      label: state.label,
      elementableType: "TextInput",
      params: state
    });

    this.setState({
      errors
    });

    // Notify updates to parent component.
    // Result should have errors,
    // Numeric fields converted to null instead of empty string "".

    let formChangeResults = {
      elementableData: {
        min: this.state.min === "" ? null : this.state.min,
        max: this.state.max === "" ? null : this.state.max,
        placeholder: this.state.placeholder,
        regex: this.state.regex === "" ? null : this.state.regex,
        multiline: this.state.multiline,
        required: this.state.required
      },
      elementData: {
        label: this.state.label,
        variableName: this.state.variableName
      }
    };

    this.props.notifyChanges(formChangeResults);

  }

  onChangeLabel = e => { this.setState({ label: e.target.value }, this.processChanges); }
  onChangeVariableName = e => { this.setState({ variableName: e.target.value }, this.processChanges); }
  onChangeRequired = e => { this.setState({ required: e.target.checked }, this.processChanges); }
  onChangeMultiline = e => { this.setState({ multiline: e.target.checked }, this.processChanges); }
  onChangeRegex = e => { this.setState({ regex: e.target.value }, this.processChanges); }
  onChangePlaceholder = e => { this.setState({ placeholder: e.target.value }, this.processChanges); }
  onChangeMin = e => {

    // This is so that the user can clear the input (make it empty).
    if(e.target.value.length === 0){
      return this.setState({ min: "" }, this.processChanges);
    }

    let v = Number(e.target.value);
    if(v < 0) return;
    this.setState({ min: v }, this.processChanges);
  }
  onChangeMax = e => {

    // This is so that the user can clear the input (make it empty).
    if(e.target.value.length === 0){
      return this.setState({ max: "" }, this.processChanges);
    }

    let v = Number(e.target.value);
    if(v <= 0) return;
    this.setState({ max: v }, this.processChanges);
  }
  render(){

    return (
      <div>
        <h2>Text Input</h2>

        <div className="mb-4">
          <Path path={this.props.getPathFor(this.props.item.id)}/>
        </div>

        <div className="mb-4">
          Label<br/>
          <input value={this.state.label} onChange={this.onChangeLabel}/>
          <div className="small-error-label">
            {this.state.errors.label ? "入力 this shit" : ""}
          </div>
        </div>

        <div className="mb-4">
          Variable name<br/>
          <input value={this.state.variableName} onChange={this.onChangeVariableName}/>
          <div className="small-error-label">
            {this.state.errors.variableName ? "入力 this shit" : ""}
            {this.state.variableName && this.props.isVariableNameRepeated(this.props.item.id) ? "Already in use" : ""}
          </div>
        </div>

        <div className="mb-4">
          Required<br/>
          <input type="checkbox" checked={this.state.required} onChange={this.onChangeRequired}/>
        </div>

        <div className="mb-4">
          Allow multiline<br/>
          <input type="checkbox" checked={this.state.multiline} onChange={this.onChangeMultiline}/>
        </div>

        <div className="mb-4">
          Regex<br/>
          <input value={this.state.regex} onChange={this.onChangeRegex}/>
          <div className="small-error-label">
            {this.state.errors.regex ? "This regex is wrong af lul" : ""}
          </div>
        </div>

        <div className="mb-4">
          Placeholder<br/>
          <input value={this.state.placeholder} onChange={this.onChangePlaceholder}/>
        </div>

        <div className="mb-4">
          Length<br/>
          <input type="number" value={this.state.min} onChange={this.onChangeMin}/> -
          <input type="number" value={this.state.max} onChange={this.onChangeMax}/>
          <div className="small-error-label">
            {this.state.errors.min || this.state.errors.max ? "Set the range correctly" : ""}
          </div>
        </div>

      </div>
    );
  }
}

class OptionInputSettings extends ComponentSettings {

  constructor(){
    super();
    this.state = {
      newOpt: {
        label: "",
        value: ""
      }
    };
  }

  static getDerivedStateFromProps(props, state){
    return ComponentSettings.getComponentFormProps(props, state, {
      required: false,
      componentType: "pulldown",
      options: []
    });
  }

  // This method should be executed after the form is changed.
  // Then, it will notify its parent with the changes produced (all form data),
  // including whether the form has errors.
  processChanges = () => {
    let state = this.state;

    let errors = ComponentValidator.validate({
      variableName: state.variableName,
      label: state.label,
      elementableType: "OptionInput",
      params: state
    });

    this.setState({
      errors
    });

    // Notify updates to parent component.
    // Result should have errors,
    // Numeric fields converted to null instead of empty string "".

    let formChangeResults = {
      elementableData: {
        componentType: this.state.componentType,
        required: this.state.required,
        options: this.state.options
      },
      elementData: {
        label: this.state.label,
        variableName: this.state.variableName
      }
    };

    this.props.notifyChanges(formChangeResults);

  }

  addNewOption = () => {
    let label = this.state.newOpt.label.trim();
    let value = this.state.newOpt.value.trim();

    if(label === "" || value === ""){
      return;
    }

    this.setState(state => {
      let opts = state.options;
      opts.push({
        label,
        value
      });
      state.newOpt.label = "";
      state.newOpt.value = "";
      return state;
    }, this.processChanges);
  }

  onChangeNewOptLabel = e => {
    let value = e.target.value;
    this.setState(state => {
      return {
        newOpt: {
          label: value,
          value: state.newOpt.value
        }
      };
    }, this.processChanges);
  }

  onChangeNewOptValue = e => {
    let value = e.target.value;
    this.setState(state => {
      return {
        newOpt: {
          label: state.newOpt.label,
          value: value
        }
      };
    }, this.processChanges);
  }

  onChangeLabel = e => { this.setState({ label: e.target.value }, this.processChanges); }
  onChangeVariableName = e => { this.setState({ variableName: e.target.value }, this.processChanges); }
  onChangeRequired = e => { this.setState({ required: e.target.checked }, this.processChanges); }
  onChangeComponentType = e => { this.setState({ componentType: e.target.value }, this.processChanges); }

  deleteOption = idx => {
    let opts = this.state.options;
    let newOpts = [];
    for(let i in opts){
      if(+i === +idx) continue;
      newOpts.push(opts[i]);
    }
    this.setState({
      options: newOpts
    }, this.processChanges);
  }

  render(){

    return (
      <div>
        <h2>Option Input</h2>

        <div className="mb-4">
          <Path path={this.props.getPathFor(this.props.item.id)}/>
        </div>

        <div className="mb-4">
          Label<br/>
          <input value={this.state.label} onChange={this.onChangeLabel}/>
          <div className="small-error-label">
            {this.state.errors.label ? "入力 this shit" : ""}
          </div>
        </div>

        <div className="mb-4">
          Variable name<br/>
          <input value={this.state.variableName} onChange={this.onChangeVariableName}/>
          <div className="small-error-label">
            {this.state.errors.variableName ? "入力 this shit" : ""}
            {this.state.variableName && this.props.isVariableNameRepeated(this.props.item.id) ? "Already in use" : ""}
          </div>
        </div>

        <div className="mb-4">
          Required<br/>
          <input type="checkbox" checked={this.state.required} onChange={this.onChangeRequired}/>
        </div>

        <div className="mb-4">
          Component type<br/>
          <select onChange={this.onChangeComponentType} value={this.state.componentType}>
            <option value="pulldown">Pulldown</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
          </select>
        </div>

        <div className="mb-4">
          Options<br/>

          <input value={this.state.newOpt.label} placeholder="Label" onChange={this.onChangeNewOptLabel}/>
          <input value={this.state.newOpt.value} placeholder="Value" onChange={this.onChangeNewOptValue}/>
          <button onClick={this.addNewOption}>Add +</button>

          <div className="small-error-label">
          {this.state.errors.options ? "yo dawg check it out u have to 入力 this shit" : ""}
          </div>

          {this.state.options.map((opt, i) => (
            <p key={i}>{opt.label} => {opt.value} <button onClick={() => { this.deleteOption(i) }}>X</button></p>
          ))}
        </div>

      </div>
    );
  }
}


export default class ElementConfiguration extends React.Component {

  render(){

    let type = this.props.item.elementableType;

    let props = {
      item: this.props.item,
      notifyChanges: this.props.notifyChanges,
      getPathFor: this.props.getPathFor,
      isVariableNameRepeated: this.props.isVariableNameRepeated
    };

    if(type === "Container") return <ContainerSettings {...props}/>
    if(type === "NumericInput") return <NumericInputSettings {...props}/>
    if(type === "TextInput") return <TextInputSettings {...props}/>
    if(type === "OptionInput") return <OptionInputSettings {...props}/>
    return "Incorrect component type"

  }
}
