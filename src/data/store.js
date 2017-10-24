import EventEmitter from 'events';

import dispatcher from './AppDispatcher';
import { types } from './actions';

let API_BASE = null;

let state = {
  user: {},
  digits: [],
  selection: [],
  status: '',
  modals: {
    login: false,
  },
};

class Store extends EventEmitter {
  constructor() {
    super();

    dispatcher.register((payload) => {
      console.group('Action');
      console.log(`${payload.type}: `, payload);
      console.groupEnd('Action');
      switch (payload.type) {
        case types.LOGOUT:
          logout().then(() => {
            window.location.reload();
          });
          break;
        case types.SHOW_MODAL:
          showModal(payload.modal)
            .then(() => this.emitChanges());
          break;
        case types.CLOSE_MODALS:
          closeModals()
            .then(() => this.emitChanges());
          break;
        case types.SELECT_CARD:
          selectDigit(payload.digit)
            .then(() => this.emitChanges());
          break;
        case types.SELECT_ALL:
          selectAll(true)
            .then(() => this.emitChanges());
          break;
        case types.DESELECT_ALL:
          selectAll(false)
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

  init(defaultState = {}) {
    state = {...state, ...defaultState};
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

const onSignIn = (googleUser) => {
  if (state.user.email) {
    return;
  }

  var token = googleUser.getAuthResponse().id_token;
  var headers = new Headers();

  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ token }),
    mode: 'cors',
    headers: headers,
  })
    .then(res => {
      window.location.reload();
    })
    .catch(error => {
      window.location.reload();
    });
};
window.onSignIn = onSignIn;

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

function getSelected(digits) {
  return digits.filter(row => row.selected);
}

function selectDigit(digit) {
  return new Promise((resolve) => {
    state = nextState('digits', (digits) => digits.map((row) => {
      if (row.key === digit.key) {
        row.selected = !(Boolean(row.selected));
      }
      return row;
    }));
    state = nextState('selection', () => getSelected(state.digits));
    resolve();
  });
}

function selectAll(select) {
  return new Promise((resolve) => {
    state = nextState('digits', (digits) => digits.map((row) => {
      row.selected = select;
      return row;
    }));
    state = nextState('selection', () => getSelected(state.digits));
    resolve();
  });
}

function showModal(modal) {
  return new Promise((resolve) => {
    const newModals = {};
    Object.keys(state.modals).forEach((key) => {
      newModals[key] = false;
      if (modal === key) {
        newModals[key] = true;
      }
    });

    state = nextState('modals', () => newModals);
    resolve();
  });
}

function closeModals() {
  return new Promise((resolve) => {
    const newModals = {};
    Object.keys(state.modals).forEach((key) => {
      newModals[key] = false;
    });

    state = nextState('modals', () => newModals);
    resolve();
  });
}

function logout() {
  return new Promise((resolve) => {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut()
      .then(() => fetch(`${API_BASE}/logout`, { credentials: 'include' }))
      .then(() => {
        auth2.disconnect();
        resolve();
      });
  });
}

export default new Store();
