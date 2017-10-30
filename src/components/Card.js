import PropTypes from 'prop-types';
import React from 'react';

import Canvas from './Canvas';

const Card = ({ pixels, prediction = null, correct, onClick, selected, preDelete }) => (
  <div className={`card card_inline ${selected ? 'card_selected' : ''} ${preDelete ? 'card_fadeout' : ''}`} onClick={onClick}>
    <Canvas pixels={pixels} />
    <ul className={`card-toolbar color_prediction-${correct === undefined ? 'unset' : (correct ? 'correct' : 'wrong')}`}>
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
  correct: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  preDelete: PropTypes.bool,
};

export default Card;
