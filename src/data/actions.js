import dispatcher from './AppDispatcher';

const genPayload = (type, data = {}) => {
  return {
    type,
    ...data,
  };
};

export const types = {
  LOAD_DIGITS: 'load-digits',
  SELECT_CARD: 'select-card',
  SELECT_ALL: 'select-all',
  DESELECT_ALL: 'deselect-all',
  SHOW_MODAL: 'show-modal',
  CLOSE_MODALS: 'close-modals',
  LOGOUT: 'logout',
  DELETE_PROMPT: 'delete-prompt',
  DELETE: 'delete',
};

const Actions = {
  loadDigits() {
    return dispatcher.dispatch(genPayload(types.LOAD_DIGITS));
  },
  select(digit) {
    return dispatcher.dispatch(genPayload(types.SELECT_CARD, { digit }));
  },
  selectAll() {
    return dispatcher.dispatch(genPayload(types.SELECT_ALL));
  },
  deselectAll() {
    return dispatcher.dispatch(genPayload(types.DESELECT_ALL));
  },
  showModal(modal) {
    return dispatcher.dispatch(genPayload(types.SHOW_MODAL, { modal }));
  },
  closeModals() {
    return dispatcher.dispatch(genPayload(types.CLOSE_MODALS));
  },
  logout() {
    return dispatcher.dispatch(genPayload(types.LOGOUT));
  },
  deletePrompt() {
    return dispatcher.dispatch(genPayload(types.DELETE_PROMPT));
  },
  deleteAll() {
    return dispatcher.dispatch(genPayload(types.DELETE));
  },
};

export default Actions;