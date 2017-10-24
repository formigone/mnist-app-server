import PropTypes from 'prop-types';
import React from 'react';

import actions from '../data/actions';

const Nav = ({ icon, admin, picture, selection, allSelected }) => (
  <nav className="nav">
    <div className="nav-status">
      <img src={icon} />
      {selection.length > 0 && (
        <span className="nav-status-text">{selection.length} selected</span>
      )}
    </div>

    {selection.length === 0 && (
      <ul className="nav-options">
        <li><i className="fa fa-refresh" title="Reload" /></li>
        <li onClick={() => actions.selectAll()}><i className="fa fa-check-square-o" title="Select all" /></li>
        {picture && (
          <li onClick={() => actions.logout()} className="user-icon"><img src={picture} /></li>
        )}
        {!picture && (
          <li onClick={() => actions.showModal('login')}><i className="fa fa-sign-in" title="Login" /></li>
        )}
      </ul>
    )}

    {selection.length > 0 && (
      <ul className="nav-options">
        <li><i className="fa fa-floppy-o" title="Save as" /></li>
        <li><i className="fa fa-bar-chart" title="Details" /></li>
        {admin && (
          <li onClick={() => actions.deletePrompt()}><i className="fa fa-trash-o" title="Delete" /></li>
        )}
        <li onClick={() => actions.deselectAll()}><i className="fa fa-square-o" title="Deselect all" /></li>
        {picture && (
          <li onClick={() => actions.logout()} className="user-icon"><img src={picture} /></li>
        )}
        {!picture && (
          <li onClick={() => actions.showModal('login')}><i className="fa fa-sign-in" title="Login" /></li>
        )}
      </ul>
    )}
  </nav>
);

Nav.propTypes = {
  admin: PropTypes.bool,
  icon: PropTypes.string,
  picture: PropTypes.string,
  selection: PropTypes.arrayOf(PropTypes.object),
  allSelected: PropTypes.bool,
};

export default Nav;
