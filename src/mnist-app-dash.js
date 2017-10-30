import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import './style.css';

import store from './data/store';
import actions from './data/actions';

import Nav from './components/Nav';
import Card from './components/Card';
import DigitDetail from './components/DigitDetail';
import SnackBar from './components/SnackBar';
import Modal from './components/Modal';
import ModalContent from './components/ModalContent';

class MnistAppDash extends PureComponent {
  static propTypes = {
    api: PropTypes.string,
    icon: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string,
      picture: PropTypes.string,
      admi: PropTypes.bool,
    }),
  };

  constructor(props) {
    super(props);
    store.init(this.props);
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
    const { state, props } = this;
    return (
      <div>
        <Nav
          admin={state.user.admin}
          icon={props.icon}
          picture={props.user.picture}
          selection={state.selection}
          allSelected={state.selection.length === state.digits.length} />
        <div className="container">
          {state.digits.map(digit => (digit.value ? (
              <Card
                key={digit.key}
                pixels={digit.value.pixels}
                prediction={digit.value.prediction}
                correct={digit.value.correct}
                selected={digit.selected}
                preDelete={digit.preDelete}
                onClick={() => {
                  {/*actions.select(digit)*/}
                  const href = `intent:#Intent;action=android.intent.action.SEND;type=text/mnist;S.android.intent.extra.TEXT=${encodeURIComponent(JSON.stringify({
                    key: digit.key,
                    pixels: digit.value.pixels }))};end`;
                  window.location.href = href;
                  console.log(href);
                }} />
            ) : null))}
        </div>
        <h1>{state.modals.login}</h1>
        <div style={{ display: (state.modals.login ? 'block' : 'none') }}>
          <Modal>
            <ModalContent>
              <h1 className="modal-content_title">Sign in with</h1>
              <div className="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>
            </ModalContent>
          </Modal>
        </div>
        {state.modals.delete && (
          <Modal>
            <ModalContent>
              <h1 className="modal-content_title">Are you sure you want to delete {state.selection.length} item{state.selection.length !== 1 ? 's' : ''}?</h1>
              <button onClick={() => actions.closeModals()} className="btn">Cancel</button>
              <button onClick={() => actions.deleteAll()} className="btn">Delete</button>
            </ModalContent>
          </Modal>
        )}
        {state.modals.details && (
          <Modal>
            <ModalContent>
              {state.selection.map((digit) => <DigitDetail key={digit.key} {...digit.value} onSetCorrect={(correct) => actions.setCorrect(digit.key, correct)} />)}
            </ModalContent>
          </Modal>
        )}
        <SnackBar msg={state.status} />
      </div>
    );
  }
}

export default MnistAppDash;
module.exports = MnistAppDash;