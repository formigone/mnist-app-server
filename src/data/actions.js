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
};

export default Actions;