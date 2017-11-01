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
    delete: false,
    details: false,
  },
};

class Store extends EventEmitter {
  constructor() {
    super();

    dispatcher.register((payload) => {
      if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`Action - ${payload.type}`);
        console.log(payload);
        console.groupEnd();
      }

      state = nextState('status', () => '');

      switch (payload.type) {
        case types.DELETE_PROMPT:
          deletePrompt().then(() => this.emitChanges());
          break;
        case types.DELETE:
          state = nextState('status', () => 'Deleting...');
          this.emitChanges();
          preDeleteAll()
            .then(() => this.emitChanges());

          setTimeout(() => {
            deleteAll()
              .then(() => {
                state = nextState('status', () => '');
                this.emitChanges();
              })
              .catch((error) => {
              console.log('ERROR', { error })
                state = nextState('status', () => String(error));
                this.emitChanges();
              });
          }, 1000);
          break;
        case types.CLASSIFY:
          classifyInApp()
            .then(() => this.emitChanges());
          break;
        case types.SET_ACTUAL:
          state = nextState('status', () => 'Updating...');
          this.emitChanges();
          setActual(payload.id, payload.actual)
            .then(() => {
              state = nextState('status', () => '');
              this.emitChanges();
            });
          break;
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
              return new Promise((resolve) => {
                setTimeout(() => resolve(), 100);
              });
            })
            .then(() => {
              let loaded = 0;
              const next = (digits, i) => {
                loadDigit(digits[i].id)
                  .then(() => {
                    loaded += 1;
                    if (loaded % 50 === 0) {
                      this.emitChanges();
                    }

                    if (loaded === state.digits.length) {
                      state = nextState('status', () => '');
                      this.emitChanges();
                    } else {
                      // setTimeout(() => next(digits, i + 1), 0);
                      next(digits, i + 1);
                    }
                  });
              };
              next(state.digits, 0);
            });
          break;
        default:
        // do nothing
      }
    });
  }

  init(defaultState = {}) {
    state = { ...state, ...defaultState };
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

  const token = googleUser.getAuthResponse().id_token;
  const headers = new Headers();

  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');

  fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ token }),
    headers,
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
        state = nextState('digits', () => digits.map((id) => ({ id })));
        resolve();
      });
  });
}

function loadDigit(id) {
  return new Promise((resolve, reject) => {
    cache.get(id)
      .then((digit) => {
        if (digit) {
          return digit;
        }

        return fetch(`${API_BASE}/digit/${id}`)
          .then((res) => res.json())
          .then((digit) => {
          console.log('DIGIT', { digit })
            cache.set(id, digit);
            return digit;
          });
      })
      .then((digit) => {
        state = nextState('digits', (digits) => digits.map((row) => {
          if (row.id === id) {
            row = digit;
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
      if (row.id === digit.id) {
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

function deletePrompt() {
  return new Promise((resolve) => {
    closeModals();
    state = nextState('modals', (modals) => ({ ...modals, ...{ 'delete': true } }));
    resolve();
  });
}

function deleteAll() {
  return new Promise((resolve, reject) => {
    const selections = state.selection.map(selection => selection.id);
    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    fetch(`${API_BASE}/digit`, {
      credentials: 'include',
      method: 'DELETE',
      body: JSON.stringify(selections),
      headers,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Could not delete digits');
        }
      })
      .then(() => {
        state.selection.forEach(({ id }) => {
          try {
            window.localStorage.removeItem(id);
          } catch (e) {
            // ignore
          }
        });
        state = nextState('digits', (digits) => digits.filter((digit) => !digit.selected));
        state = nextState('selection', () => getSelected(state.digits));
        closeModals();
        resolve();
      })
      .catch((error) => {
        state = nextState('digits', (digits) => digits.map(digit => {
          digit.selected = false;
          digit.preDelete = false;
          return digit;
        }));
        state = nextState('selection', () => getSelected(state.digits));
        reject(error);
      });
  });
}

function preDeleteAll() {
  return new Promise((resolve) => {
    state = nextState('digits', (digits) => digits.map((digit) => {
      if (digit.selected) {
        digit.preDelete = true;
      }
      return digit;
    }));
    closeModals();
    resolve();
  });
}

function setActual(id, actual) {
  return new Promise((resolve) => {
    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    fetch(`${API_BASE}/digit`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ id, actual }),
      headers,
    })
      .then((res) => res.json())
      .then(() => {
        let data = null;
        state = nextState('digits', (digits) => digits.map((digit) => {
          if (digit.id === id) {
            digit.actual = actual;
            digit.selected = false;
            data = digit;
          }
          return digit;
        }));
        return data;
      })
      .then((digit) => cache.set(id, digit))
      .then(() => resolve());
  });
}

function classifyInApp() {
  return new Promise((resolve) => {
    const data = state.selection.map(({ id, value: { pixels }}) => ({ id, pixels }));
    const href = `intent:#Intent;action=android.intent.action.SEND;type=text/mnist;S.android.intent.extra.TEXT=${encodeURIComponent(JSON.stringify(data))};end`;
    window.location.href = href;
    resolve();
  });
}

export default new Store();
