import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

class Canvas extends PureComponent {
  static propTypes = {
    pixels: PropTypes.arrayOf(PropTypes.number),
  }

  constructor(props) {
    super(props);
  }

  renderCanvas(canvas, pixels) {
    if (!canvas) {
      return null;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let px = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let max = Number.MAX_SAFE_INTEGER;
    let min = Number.MIN_SAFE_INTEGER;

    pixels.forEach(function (val) {
      if (val > min) {
        min = val;
      }

      if (val < max) {
        max = val;
      }
    });

    let tmp = max;
    max = min;
    min = tmp;

    pixels = pixels.map(function (val) {
      return 1 - (val - min) / (max - min);
    });

    for (let i = 0, _i = 0; i < pixels.length * 4; i += 4, _i += 1) {
      let val = pixels[_i];
      px.data[i] = px.data[i + 1] = px.data[i + 2] = 255 * val;
      px.data[i + 3] = 255;
    }
    ctx.putImageData(px, 0, 0);
  };

  render() {
    return (
      <canvas width="28" height="28" ref={(el) => this.renderCanvas(el, this.props.pixels)} />
    )
  }
}

export default Canvas;
