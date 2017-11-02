import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import Canvas from './Canvas';

const Digit = ({ prediction, actual, pixels = [], percentages = [], onSetActual }) => {
  percentages = normalize(percentages);
  return (
    <div className="digit-details">
      <Prediction prediction={prediction} actual={actual} onSetActual={onSetActual} />
      <Canvas pixels={pixels} className="digit-details_sample"/>
      <BarGraph percentages={percentages} />
      <Summary percentages={percentages} />
    </div>
  );
};

Digit.propTypes = {
  prediction: PropTypes.number,
  actual: PropTypes.number,
  pixels: PropTypes.arrayOf(PropTypes.number),
  percentages: PropTypes.arrayOf(PropTypes.number),
  onSetCorrect: PropTypes.func,
};

class Prediction extends PureComponent {
  static propTypes = {
    prediction: PropTypes.number,
    actual: PropTypes.number,
    onSetActual: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSelection: false,
    };
  }

  makeSelection(value) {
    this.props.onSetActual(value);
    this.setState({ showSelection: false });
  }

  render (){
    const { showSelection } = this.state;
    const { actual, prediction, onSetActual } = this.props;

    return (
      <ul className="prediction-container">
        <li onClick={() => onSetActual(prediction)} className={actual !== null && prediction === actual ? 'prediction-correct' : ''}>
          <span className="fa fa-chevron-up" />
        </li>
        <li className="prediction">{prediction || '--'}</li>
        <li className={actual !== null && prediction !== actual ? 'prediction-wrong' : ''}>
          {showSelection && (
            <select onChange={({target}) => this.makeSelection(Number(target.value))}>
              {['-', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (<option value={val} key={val}>{val}</option>))}
            </select>
          )}
          {!showSelection && (
            <span className="fa fa-chevron-down" onClick={() => this.setState({ showSelection: true })} />
          )}
        </li>
      </ul>
    );
  }
};

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
