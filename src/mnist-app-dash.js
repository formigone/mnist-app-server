import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import './style.css';

import store from './data/store';
import actions from './data/actions';

import Nav from './components/Nav';
import Card from './components/Card';
import SnackBar from './components/SnackBar';

class MnistAppDash extends PureComponent {
  static propTypes = {
    api: PropTypes.string,
  }

  constructor(props) {
    super(props);
    store.setApiBase(this.props.api);
    this.state = store.getState();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    store.addEventListener(this.handleChange);
    actions.loadDigits();
  }

  componentWillUnmount() {
    store.removeEventListener(this.handleChange);
  }

  handleChange() {
    this.setState(store.getState());
  }

  render() {
    const { state } = this;
    return (
      <div>
        <Nav />
        <div className="container">
        {state.digits.map(digit => (digit.value ? <Card key={digit.key} pixels={digit.value.pixels} prediction={digit.value.prediction} /> : null))}
        {/*{state.digits.map(digit => (<p key={digit.key}>{digit.key}</p>))}*/}
        </div>
        <SnackBar msg={state.status} />
      </div>
    );
  }
}

export default MnistAppDash;
module.exports = MnistAppDash;