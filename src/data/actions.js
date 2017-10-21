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
};

const Actions = {
  loadDigits() {
    return dispatcher.dispatch(genPayload(types.LOAD_DIGITS));
  },
  select(digit) {
    console.log('click')
    return dispatcher.dispatch(genPayload(types.SELECT_CARD, { digit }));
  },
};

export default Actions;