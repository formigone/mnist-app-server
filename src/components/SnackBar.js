import PropTypes from 'prop-types';
import React from 'react';

const SnackBar = ({ msg }) => (
  msg ? <div className="snackbar">{ msg }</div> : null
);

SnackBar.propTypes = {
  msg: PropTypes.string,
};

export default SnackBar;
