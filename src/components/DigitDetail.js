import PropTypes from 'prop-types';
import React from 'react';

import Canvas from './Canvas';

const Digit = ({ prediction, correct, pixels, percentages, onSetCorrect }) => {
  percentages = normalize(percentages);
  return (
    <div className="digit-details">
      <Prediction prediction={prediction} correct={correct} onSetCorrect={onSetCorrect} />
      <Canvas pixels={pixels} className="digit-details_sample"/>
      <BarGraph percentages={percentages} />
      <Summary percentages={percentages} />
    </div>
  );
};

Digit.propTypes = {
  prediction: PropTypes.number,
  correct: PropTypes.bool,
  pixels: PropTypes.arrayOf(PropTypes.number),
  percentages: PropTypes.arrayOf(PropTypes.number),
  onSetCorrect: PropTypes.func,
};

const Prediction = ({ prediction, correct, onSetCorrect }) => (
  <ul className="prediction-container">
    <li onClick={() => onSetCorrect(true)} className={correct === true ? 'prediction-correct' : ''}>
      <span className="fa fa-chevron-up"/>
    </li>
    <li className="prediction">{prediction || '--'}</li>
    <li onClick={() => onSetCorrect(false)} className={correct === false ? 'prediction-wrong' : ''}>
      <span className="fa fa-chevron-down"/>
    </li>
  </ul>
);

const BarGraph = ({ percentages = [] }) => (
  <ul className="bar-graph">
    {percentages.map((percentage, i) => (
      <li key={`percentage/${i}`} style={{animation: 'stretch 0.5s ease-out', width: `${percentage * 2}%`}} />
    ))}
  </ul>
);

const Summary = ({ percentages = [] }) => {
  if (percentages.length === 0) {
    return null;
  }

  percentages = [...percentages];
  percentages.sort((a, b) => {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });

  return (
    <p className="digit-details_summary">{Number(percentages[0]).toFixed(2)}% (<span className="digit-details_sub_summary">{Number(percentages[1]).toFixed(2)}%</span>)</p>
  )
};

const normalize = (list = []) => {
  const { min, max, sum } = list.reduce((acc, row) => {
    if (row < acc.min) {
      acc.min = row;
    }

    if (row > acc.max) {
      acc.max = row;
    }

    return acc;
  }, { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER });

  if (list) {
    const oneNth = 1 / list.length;

    list = list.map((row) => {
      if (max === min) {
        return oneNth;
      }

      return (row - min) / (max - min);
    });

    const sum = list.reduce((acc, row) => acc + row, 0);
    return list.map((row) => {
      if (sum === 0) {
        return oneNth;
      }

      return row / sum * 100;
    });
  }
};

export default Digit;
