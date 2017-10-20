import EventEmitter from 'events';

import dispatcher from './AppDispatcher';
import { types } from './actions';

let API_BASE = null;

let state = {
  digits: [],
  status: '',
};

class Store extends EventEmitter {
  constructor() {
    super();

    dispatcher.register((payload) => {
      switch (payload.type) {
        case types.LOAD_DIGITS:
          state = nextState('status', () => 'Loading...');
          this.emitChanges();

          loadDigits()
            .then(() => {
              this.emitChanges();
            })
            .then(() => {
              let loaded = 0;
              state.digits.forEach(digit => {
                loadDigit(digit.key)
                  .then(() => {
                    loaded += 1;
                    this.emitChanges();

                    if (loaded === state.digits.length) {
                      state = nextState('status', () => '');
                      this.emitChanges();
                    }
                  });
              });
            });
          break;
        default:
        // do nothing
      }
    });
  }

  setApiBase(url) {
    API_BASE = url;
  }

  getState(attr = null) {
    if (attr === null) {
      return state;
    }

    return state[attr];
  }

  emitChanges(event) {
    this.emit('change', event);
  }

  addEventListener(onChange) {
    this.on('change', onChange);
  }

  removeEventListener(onChange) {
    this.removeListener('change', onChange);
  }
}

function nextState(attr, next) {
  return {
    ...state,
    [attr]: next(state[attr]),
  };
}

function loadDigits() {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/digits`)
      .then(res => res.json())
      .then(digits => {
        console.log(digits);
        state = nextState('digits', () => digits.map((digit) => ({ key: digit })));
        console.log('state', state)
        resolve();
      });
  });
}

function loadDigit(key) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/digit/${key}`)
      .then(res => res.json())
      .then(digit => {
        console.log(digit);
        state = nextState('digits', (digits) => digits.map((row) => {
          if (row.key === key) {
            row.value = digit.response;
          }
          return row;
        }));
        resolve();
      });
  });
}

export default new Store();
