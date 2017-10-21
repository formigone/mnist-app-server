import EventEmitter from 'events';

import dispatcher from './AppDispatcher';
import { types } from './actions';

let API_BASE = null;

let state = {
  digits: [],
  selection: [],
  status: '',
};

class Store extends EventEmitter {
  constructor() {
    super();

    dispatcher.register((payload) => {
      switch (payload.type) {
        case types.SELECT_CARD:
          selectDigit(payload.digit)
            .then(() => this.emitChanges());
          break;
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

const cache = {
  get(key) {
    return new Promise((resolve) => {
      try {
        let data = window.localStorage.getItem(key);
        if (data) {
          console.log('hit', key);
          data = JSON.parse(data);
        }
        resolve(data);
      } catch (error) {
        resolve(data);
      }
    });
  },
  set(key, data) {
    return new Promise((resolve) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(data));
        resolve(data);
      } catch (error) {
        resolve(data);
      }
    });
  },
  remove(key) {
    return new Promise((resolve) => {
      try {
        window.localStorage.removeItem(key);
        resolve();
      } catch (error) {
        resolve();
      }
    });
  },
};

function loadDigits() {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE}/digits`)
      .then(res => res.json())
      .then(digits => {
        state = nextState('digits', () => digits.map((digit) => ({ key: digit })));
        resolve();
      });
  });
}

function loadDigit(key) {
  return new Promise((resolve, reject) => {
    cache.get(key)
      .then((digit) => {
        if (digit) {
          return digit;
        }

        return fetch(`${API_BASE}/digit/${key}`)
          .then((res) => res.json())
          .then((digit) => cache.set(key, digit));
      })
      .then((digit) => {
        state = nextState('digits', (digits) => digits.map((row) => {
          if (row.key === key) {
            row.value = digit;
          }
          return row;
        }));
        resolve();
      });
  });
}

function selectDigit(digit) {
  return new Promise((resolve) => {
    state = nextState('selection', (selection) => [...selection, digit]);
    state = nextState('digits', (digits) => digits.map((row) => {
      if (row.key === digit.key) {
        row.selected = !(Boolean(row.selected));
      }
      return row;
    }));
    resolve();
  });
}

export default new Store();
