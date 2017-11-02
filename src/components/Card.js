import PropTypes from 'prop-types';
import React from 'react';

import Canvas from './Canvas';

const Card = ({ pixels = [], prediction, actual, onClick, selected, preDelete }) => (
  <div className={`card card_inline ${selected ? 'card_selected' : ''} ${pixels.length === 0 ? 'card-loading' : ''} ${preDelete ? 'card_fadeout' : ''}`} onClick={onClick}>
    <Canvas pixels={pixels} />
    <ul className={`card-toolbar color_prediction-${actual === null ? 'unset' : (actual === prediction ? 'correct' : 'wrong')}`}>
      <li className="card-toolbar_col"><h3 className="card-toolbar-prediction">{prediction === undefined ? '--' : prediction}</h3></li>

      {1 > 2 && (
        <li className="card-toolbar-settings">
          <button>Copy</button>
        </li>
      )}
    </ul>
  </div>
);

Card.propTypes = {
  pixels: PropTypes.arrayOf(PropTypes.number),
  prediction: PropTypes.number,
  actual: PropTypes.number,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  preDelete: PropTypes.bool,
};

export default Card;
