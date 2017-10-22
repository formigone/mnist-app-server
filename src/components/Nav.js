import PropTypes from 'prop-types';
import React from 'react';

import actions from '../data/actions';

const Nav = ({ selection, allSelected }) => (
  <nav className="nav">
    <div className="nav-status">
      <img src="/favicon-32x32.png" />
      {selection.length > 0 && (
        <span className="nav-status-text">{selection.length} selected</span>
      )}
    </div>

    {selection.length === 0 && (
      <ul className="nav-options">
        <li><i className="fa fa-refresh" title="Reload" /></li>
        <li onClick={() => actions.selectAll()}><i className="fa fa-check-square-o" title="Select all" /></li>
        <li><i className="fa fa-sign-in" title="Login" /></li>
      </ul>
    )}

    {selection.length > 0 && (
      <ul className="nav-options">
        {selection.length === 1 && (
          <li><i className="fa fa-bar-chart" title="Classification details" /></li>
        )}
        <li><i className="fa fa-floppy-o" title="Save as" /></li>
        <li><i className="fa fa-pencil" title="Edit" /></li>
        <li><i className="fa fa-thumbs-o-down" title="Mark classification as incorrect" /></li>
        <li><i className="fa fa-thumbs-o-up" title="Mark classification as correct" /></li>
        <li onClick={() => actions.deselectAll()}><i className="fa fa-square-o" title="Deselect all" /></li>
        <li><i className="fa fa-trash-o" title="Delete" /></li>
      </ul>
    )}
  </nav>
);

Nav.propTypes = {
  selection: PropTypes.arrayOf(PropTypes.object),
  allSelected: PropTypes.bool,
};

export default Nav;
