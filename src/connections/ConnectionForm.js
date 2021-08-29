import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { CirclePicker } from 'react-color';

/*
TODO: Should this constant be imported from some other file like a React-CSS file?
(I haven't used that so I don't know, but sounds like it might be useful?).
This constant is also being used by ConnectionTitle to render the colors.

https://www.w3schools.com/react/react_css.asp
xxx.module.css can be used and it works well probably.
*/
export const COLOR_MAP = {
  'blue':   '#3A67EE',
  'white':  '#EEEEEE',
  'red':    '#EE3A3A',
  'pink':   '#EF74CD',
  'green':  '#006666',
  'black':  '#111111',
  'yellow': '#FCDF03',
  'purple': '#A32EA3',
  'orange': '#EBAA2A',
  'gray':   '#AAAAAA'
};

// Available hex colors.
const COLORS_AVAILABLE = Object.keys(COLOR_MAP).map(key => COLOR_MAP[key]);

const DB_LABELS = {
  mysql: 'MySQL',
  postgres: 'PostgreSQL'
}

const DEFAULT_PORTS = {
  mysql: 3306,
  postgres: 5432
}

const DEFAULT_VALUES = {
  name: '',
  user: '',
  pass: '',
  host: '',
  port: '',
  description: '',
  color: Object.keys(COLOR_MAP)[0],
  dbType: Object.keys(DB_LABELS)[0]
};

class ConnectionForm extends React.Component{
  constructor(){
    super();
    this.state = {
      changePassword: false
    };

    Object.keys(DEFAULT_VALUES).forEach(key => {
      this.state[key] = DEFAULT_VALUES[key];
    });
  }

  updateInput = (input, event) => {
    let value = event.target.value;
    this.setState({ [input]: value }, this.notifyFormData);
  }

  onChangeColor = ev => {
    this.setState({
      color: ev.hex
    }, this.notifyFormData);
  }

  notifyFormData = () => {
    if(typeof this.props.onFormDataChange === 'function'){
      // If the user is editing password, then send the password.
      // If not, then remove the password from the object so that
      // it's not modified.
      let connection = {};
      Object.keys(DEFAULT_VALUES).forEach(key => {
        connection[key] = this.state[key];
      });

      if(!this.state.changePassword){
        delete connection.pass;
      }

      let colorCode = this.state.color.toUpperCase();
      connection.color = this.hexToName(colorCode);

      this.props.onFormDataChange(connection);
    }
  }

  // Example: #FF0000 -> 'red' (But only works for defined colors, not any arbitrary color).
  hexToName = hex => {
    hex = hex.toUpperCase();
    for(let key in COLOR_MAP){
      if(COLOR_MAP.hasOwnProperty(key) && COLOR_MAP[key] === hex){
        return key;
      }
    }
    throw new Error(`Color was not found: ${hex}`);
  }

  componentDidMount(){
    let connection = this.props.connection || {};
    let newState = {};
    Object.keys(DEFAULT_VALUES).forEach(key => {
      newState[key] = connection[key] || DEFAULT_VALUES[key];
    });

    // For new connections, always show password input.
    if(this.props.newConnection){
      newState.changePassword = true;
    }

    // Color needs to be in #RRGGBB for this form.
    // Note: this.props.connection could be null, so use newState.
    newState.color = COLOR_MAP[newState.color];

    this.setState(newState, this.notifyFormData);
  }

  changePassword = bool => {
    this.setState({ changePassword: bool }, this.notifyFormData);
  }

  render(){
    return (
      <div>
        <Form.Group>
          <Form.Label>Connection name</Form.Label>
          <Form.Control onChange={e => this.updateInput('name', e)} value={this.state.name}/>
        </Form.Group>
        <Form.Group>
          <Form.Row>
            <Col md={8}>
              <CirclePicker
              className='mb-2 mb-md-0'
              onChangeComplete={this.onChangeColor}
              value={this.state.color}
              colors={COLORS_AVAILABLE}/>
            </Col>
            <Col md={4}>
            <div className='color-selector-preview' style={{ backgroundColor: this.state.color }}/>
            </Col>
          </Form.Row>
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control onChange={e => this.updateInput('description', e)} value={this.state.description}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control onChange={e => this.updateInput('user', e)} value={this.state.user}/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <div className='mb-2'>
            {this.state.changePassword ? (
              <Form.Control
              type='password'
              onChange={e => this.updateInput('pass', e)}
              value={this.state.pass}
              placeholder={this.props.newConnection ? '' : '***************'}/>
            ) : ''}
          </div>
          {this.props.newConnection ? '' : (
            this.state.changePassword ? <Button variant='secondary' onClick={() => this.changePassword(false)}>Cancel</Button> : <Button onClick={() => this.changePassword(true)}>Change password</Button>
          )}

          {this.props.newConnection ? '' : (
            <Form.Text className='text-muted'>
              {this.state.changePassword ? 
                'If you wish to keep the same password, press the cancel button.' : 
                'If you want to change the password, press the button and enter a new password.'
              }
            </Form.Text>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Label>Type</Form.Label>
          <Form.Control as='select' onChange={e => this.updateInput('dbType', e)} value={this.state.dbType}>
            {Object.keys(DB_LABELS).map((dbType, i) => (
              <option key={i} value={dbType}>{DB_LABELS[dbType]}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Row>
            <Col md={8}>
              <Form.Label>Host</Form.Label>
              <Form.Control onChange={e => this.updateInput('host', e)} value={this.state.host}/>
            </Col>
            <Col md={4}>
              <Form.Label>Port</Form.Label>
              <Form.Control onChange={e => this.updateInput('port', e)} value={this.state.port} placeholder={DEFAULT_PORTS[this.state.dbType]} type='number'/>
            </Col>
          </Form.Row>
          <Form.Text className='text-muted'>
            If port is not specified, then the default port for {DB_LABELS[this.state.dbType]} ({DEFAULT_PORTS[this.state.dbType]}) will be used.
          </Form.Text>
        </Form.Group>
      </div>
    );
  }
}

export default ConnectionForm;
