import React from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Util.scss';

const EMPTY_CELL_VALUE = <span className='small-text'>(empty)</span>;

export default class Util{
  // Example
  // Param: helloWorld
  // Return: Hello World
  static prettyCase(camelcaseString){
    if(typeof camelcaseString !== 'string') return camelcaseString;
    return camelcaseString.split(/([A-Z][a-z]+)/).filter(str => str.trim().length > 0).map(Util.capitalizeFirstLetter).join(' ');
  }

  static removeEmptyValues(object){
    Object.keys(object).forEach((key) => {
      if(object[key] == null || object[key] === ''){
        delete object[key];
      }
    });
  }

  static booleanDecorator = (value, trueElement = <FontAwesomeIcon className='boolean-decorator-true' icon={faCheck}/>, falseElement = <FontAwesomeIcon className='boolean-decorator-false' icon={faTimes}/>) => {
    if(typeof value === 'boolean'){
      return value ? trueElement : falseElement;
    }
    return value;
  }

  static emptyDecorator = (value, output = EMPTY_CELL_VALUE) => {
    if((typeof value === 'string' && value.trim().length === 0) || value === null){
      return output;
    }
    return value;
  }

  // Returns a new object.
  static objectAssignExistingKeys = (source, obj) => {
    let newObj = {}
    let existingKeys = Object.keys(source);
    for(let k in existingKeys){
      let key = existingKeys[k];
      newObj[key] = obj.hasOwnProperty(key) ? obj[key] : source[key];
    }
    return newObj;
  }

  static formatDate = (dateString) => {
    return moment(dateString).format('YYYY MMM DD, H:mm A');
  }

  static isDate = (obj) => {
    return obj instanceof Date && isFinite(obj);
  }

  static dateDecorator = (string) => {
    let date = new Date(string);
    if(Util.isDate(date) && date.toISOString() === string){
      return (
        <span title={date.toString()}>
          {Util.formatDate(date)}
        </span>
      );
    }
    return string;
  }

  static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  static hashString(str){
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
