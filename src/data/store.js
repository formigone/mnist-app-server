import EventEmitter from 'events';

import dispatcher from './AppDispatcher';
import actionTypes from './actionTypes';

let STORIES_API = '';
const STORE_KEY = 'kslcom:queue';

/** @type {DefState} defaultState */
const defaultState = {
  stories: [],
  idBlacklist: {},
  offset: 0,
  loading: false,
  continueLoading: true,
};

/** @type {DefState} state */
let state = {};

class Store extends EventEmitter {
  constructor(_state = defaultState) {
    super();

    state = _state;

    dispatcher.register((payload) => {
      switch (payload.type) {
        case actionTypes.NEXT_PAGE:
          next(payload, this.emitChanges.bind(this));
          break;
        case actionTypes.RESTORE:
          restore(this.emitChanges.bind(this));
          break;
        default:
        // do nothing
      }
    });
  }

  getState(attr = null) {
    if (attr === null) {
      return state;
    }

    return state[attr];
  }

  merge(newState) {
    state = {
      ...state,
      ...newState,
    };
  }

  setApiUrl(url) {
    STORIES_API = url;
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

function calculateNextState(currState, attr, next) {
  return {
    ...currState,
    [attr]: next(currState[attr]),
  };
}

function genStoreKey() {
  return `${STORE_KEY}:${window.location.pathname}`;
}

function save(key, data) {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }

  try {
    window.sessionStorage.setItem(key, data);
    window.sessionStorage.setItem(`${key}:history`, window.history.length);
    window.sessionStorage.setItem(`${key}:href`, window.location.href);
  } catch (e) {
    // couldn't access session storage
  }
}

function restore(emitChanges) {
  const key = genStoreKey();

  try {
    if (state.persistPaging) {
      const backFromTheFuture = window.history.length === Number(window.sessionStorage.getItem(`${key}:history`)) + 1;
      if (!backFromTheFuture) {
        window.sessionStorage.removeItem(key);
        window.sessionStorage.removeItem(`${key}:history`);
        window.sessionStorage.removeItem(`${key}:href`);
        return;
      }

      let data = window.sessionStorage.getItem(key) || '{}';
      data = JSON.parse(data);
      if (data) {
        state = calculateNextState(state, 'stories', stories => data.stories || stories);
        state = calculateNextState(state, 'offset', offset => data.offset || offset);
        emitChanges('loaded');
      }
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch (e) {
    // couldn't access session storage
  }
}

function next({ queueTagIds, offset, limit }, emitChanges) {
  state = calculateNextState(state, 'loading', () => true);
  fetch(`${STORIES_API}/${queueTagIds}/${offset}/${limit}`)
    .then(res => res.json())
    .then((res) => {
      state = calculateNextState(state, 'stories', stories => [...stories, ...res]);
      state = calculateNextState(state, 'offset', offset => offset + limit);
      state = calculateNextState(state, 'loading', () => false);

      if (state.persistPaging) {
        save(`${STORE_KEY}:${window.location.pathname}`, { stories: state.stories, offset: state.offset });
      }

      if (res.length < limit) {
        state = calculateNextState(state, 'continueLoading', () => false);
      }

      emitChanges('loaded');
    })
    .catch((err) => {
      console.error(err);
      emitChanges('loaded');
    });
  emitChanges();
}

export default new Store();
