import dispatcher from './AppDispatcher';

const genPayload = (type, data = {}) => {
  return {
    type,
    ...data,
  };
};

export const types = {
  LOAD_DIGITS: 'load-digits',
};

const Actions = {
  loadDigits() {
    return dispatcher.dispatch(genPayload(types.LOAD_DIGITS));
  },
};

export default Actions;