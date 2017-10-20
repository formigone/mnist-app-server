import React, { PropTypes } from 'react';

const Nav = ({ description }) => (
  <p>
    {description}
  </p>
);

Nav.propTypes = {
  description: PropTypes.string,
};

export default Nav;
