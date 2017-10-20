import PropTypes from 'prop-types';
import React from 'react';

import Canvas from './Canvas';

const Card = ({ pixels, prediction = null }) => (
  <div className="card card_inline">
    <Canvas pixels={pixels} />
    <ul className="card-toolbar color_prediction-unset">
      <li className="card-toolbar_col"><h3 className="card-toolbar-prediction">{prediction || '--'}</h3></li>

      {1 > 2 && (
        <li className="card-toolbar-settings">
          <button>Copy</button>
        </li>
      )}
    </ul>
  </div>
);

Card.propTypes = {
  description: PropTypes.string,
};

export default Card;
