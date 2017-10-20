import PropTypes from 'prop-types';
import React from 'react';

const Nav = ({ description }) => (
  <nav className="nav">
    <img src="/favicon-32x32.png" />

    <ul className="nav-options">
      <li><i className="fa fa-refresh" /></li>
      <li><i className="fa fa-sign-in" /></li>
    </ul>
  </nav>
);

Nav.propTypes = {
  description: PropTypes.string,
};

export default Nav;
