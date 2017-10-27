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
      console.groupCollapsed(`Action - ${payload.type}`);
      console.log(payload);
      console.groupEnd();

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
              });
          }, 1000);
          break;
        case types.SET_CORRECT:
          state = nextState('status', () => 'Updating...');
          this.emitChanges();
          setCorrect(payload.key, payload.correct)
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
            })
            .then(() => {
              let loaded = 0;
              const next = (digits, i) => {
                loadDigit(digits[i].key)
                  .then((cache) => {
                    loaded += 1;
                    if (!cache && loaded % 25 === 0) {
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
          return { digit, cache: true };
        }

        return fetch(`${API_BASE}/digit/${key}`)
          .then((res) => res.json())
          .then((digit) => {
            cache.set(key, digit);
            return { digit, cache: false };
          });
      })
      .then(({ digit, cache }) => {
        state = nextState('digits', (digits) => digits.map((row) => {
          if (row.key === key) {
            row.value = digit;
          }
          return row;
        }));
        resolve(cache);
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

function deletePrompt() {
  return new Promise((resolve) => {
    closeModals();
    state = nextState('modals', (modals) => ({ ...modals, ...{ 'delete': true } }));
    resolve();
  });
}

function deleteAll() {
  return new Promise((resolve) => {
    const selections = state.selection.map(selection => selection.key);
    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    fetch(`${API_BASE}/digits`, {
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
        state.selection.forEach(({ key }) => {
          try {
            window.localStorage.removeItem(key);
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
          return digit;
        }));
        state = nextState('selection', () => getSelected(state.digits));
        resolve();
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

function setCorrect(key, correct) {
  return new Promise((resolve) => {
    const headers = new Headers();

    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    fetch(`${API_BASE}/digit`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ id: key, correct }),
      headers,
    })
      .then((res) => res.json())
      .then(() => {
        let data = null;
        state = nextState('digits', (digits) => digits.map((digit) => {
          if (digit.key === key) {
            digit.value.correct = correct;
            data = digit;
          }
          return digit;
        }));
        return data;
      })
      .then((digit) => cache.set(key, digit.value))
      .then(() => resolve());
  });
}

export default new Store();
