import React from 'react';

import actions from '../data/actions';

const Modal = ({ children }) => (
  <div className="modal">
    <button className="modal-btn-close" onClick={() => actions.closeModals()}>
      <span className="fa fa-times" />
    </button>
    {children}
  </div>
);

export default Modal;
