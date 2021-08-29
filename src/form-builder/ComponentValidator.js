export default class ComponentValidator {

  // Elements initially have an empty params hash, so before using a property
  // it must be verified that the property exists (e.g. params.array.length,
  // this will throw an "array property is undefined" error.)

  static validate(node, rootContainer = false){
    let errors = {};

    if(rootContainer){
      return ComponentValidator.validateContainer(node);
    }

    if(!node.hasOwnProperty("params")) throw new Error("No params");
    if(!node.hasOwnProperty("variableName")) throw new Error("No variableName");
    if(!node.hasOwnProperty("label")) throw new Error("No label");
    if(!node.hasOwnProperty("elementableType")) throw new Error("No elementableType");

    if(node.elementableType === "Container"){
      errors = ComponentValidator.validateContainer(node);
    } else if(node.elementableType === "TextInput"){
      errors = ComponentValidator.validateTextInput(node);
    } else if(node.elementableType === "NumericInput"){
      errors = ComponentValidator.validateNumericInput(node);
    } else if(node.elementableType === "OptionInput"){
      errors = ComponentValidator.validateOptionInput(node);
    } else {
      throw new Error(`ElementableType (${node.elementableType}) not supported.`);
    }

    return errors;
  }

  static validateContainer(container){

    let errors = {};
    if(!ComponentValidator.variableNameValid(container.variableName)){
      errors.variableName = true;
    }

    // Check repeated children variable names.
    let firstOccurrences = {};
    let repeatedIdx = [];
    for(let i in container.elements){
      let elem = container.elements[i];
      let varNam = elem.variableName;
      if(varNam.trim() === "") continue;

      if(firstOccurrences.hasOwnProperty(varNam)){
        repeatedIdx.push(+firstOccurrences[varNam]);
        repeatedIdx.push(+i);
      } else {
        firstOccurrences[varNam] = i;
      }
    }

    // Unique and sorted
    repeatedIdx = repeatedIdx.sort().filter(function(el,i,a){return i===a.indexOf(el)});
    if(repeatedIdx.length !== 0){
      errors.repeatedChildrenVariableNames = repeatedIdx;
    }

    return errors;
  }

  static validateOptionInput(optionInput){
    let errors = {};
    let params = optionInput.params;
    if(!ComponentValidator.variableNameValid(optionInput.variableName)){
      errors.variableName = true;
    }

    if(optionInput.label === null || optionInput.label.trim() === ""){
      errors.label = true;
    }

    // Only check length of options array. Options cannot be incorrect because
    // they aren't added to the array with errors in the first place.
    if(params.options && params.options.length === 0){
      errors.options = true;
    }

    return errors;
  }

  static validateNumericInput(numericInput){
    let errors = {};
    let params = numericInput.params;
    if(!ComponentValidator.variableNameValid(numericInput.variableName)){
      errors.variableName = true;
    }

    if(numericInput.label === null || numericInput.label.trim() === ""){
      errors.label = true;
    }

    if(params.min !== "" && params.max !== ""){
      if(params.min > params.max){
        errors.min = true;
        errors.max = true;
      }
    }

    return errors;
  }

  static validateTextInput(textInput){

    let errors = {};
    let params = textInput.params;

    if(params.min !== "" && params.max !== ""){
      if(params.min > params.max){
        errors.min = true;
        errors.max = true;
      }
    }

    if(textInput.label === null || textInput.label.trim() === ""){
      errors.label = true;
    }

    if(!ComponentValidator.variableNameValid(textInput.variableName)){
      errors.variableName = true;
    }

    try{
      new RegExp(params.regex);
    }catch(e){
      errors.regex = true;
    }

    return errors;

  }

  static variableNameValid(varNam){

    if(typeof varNam !== "string"){
      throw new Error("Variable name must be a string.");
    }

    if(varNam === null || varNam.trim() === ""){
      return false;
    }

    // Must comply with specifications.
    if(!/^[a-zA-Z0-9-_]{1,20}$/.test(varNam)){
      return false;
    }

    return true;
  }
}
