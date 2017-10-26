import PropTypes from 'prop-types';
import React from 'react';

import Canvas from './Canvas';

const Digit = ({ prediction, correct, pixels, percentages }) => (
  <div className="digit-details">
    <Prediction prediction={prediction} correct={correct} />
    <Canvas pixels={pixels} className="digit-details_sample"/>
    <BarGraph percentages={percentages} />
  </div>
);

Digit.propTypes = {
  prediction: PropTypes.number,
  correct: PropTypes.bool,
};

const Prediction = ({ prediction, correct }) => (
  <ul className="prediction-container">
    <li className={correct !== undefined && (correct ? 'prediction-correct' : 'prediction-wrong')}>
      <span className="fa fa-chevron-up"/>
    </li>
    <li className="prediction">{prediction || '--'}</li>
    <li className={correct !== undefined && (correct ? 'prediction-correct' : 'prediction-wrong')}>
      <span className="fa fa-chevron-down"/>
    </li>
  </ul>
);

const BarGraph = ({ percentages = [] }) => {
  const { min, max, sum } = percentages.reduce((acc, row) => {
    if (row < acc.min) {
      acc.min = row;
    }

    if (row > acc.max) {
      acc.max = row;
    }

    return acc;
  }, { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER });

  if (percentages) {
    const oneNth = 1 / percentages.length;

    percentages = percentages.map((row) => {
      if (max === min) {
        return oneNth;
      }

      return (row - min) / (max - min);
    });

    const sum = percentages.reduce((acc, row) => acc + row, 0);
    percentages = percentages.map((row) => {
      if (sum === 0) {
        return oneNth;
      }

      return row / sum * 100;
    });
  }

  return (
    <ul className="bar-graph">
      {percentages.map((percentage, i) => (
        <li key={`percentage/${i}`} style={{animation: 'stretch 0.5s', width: `${percentage}%`}} />
      ))}
    </ul>
  );
};

export default Digit;
