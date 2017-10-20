function drawCanvas(pixels, width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var px = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var max = Number.MAX_SAFE_INTEGER;
  var min = Number.MIN_SAFE_INTEGER;

  pixels.forEach(function (val) {
    if (val > min) {
      min = val;
    }

    if (val < max) {
      max = val;
    }
  });

  var tmp = max;
  max = min;
  min = tmp;

  pixels = pixels.map(function (val) {
    return 1 - (val - min) / (max - min);
  });

  for (var i = 0, _i = 0; i < pixels.length * 4; i += 4, _i += 1) {
    var val = pixels[_i];
    px.data[i] = px.data[i + 1] = px.data[i + 2] = 255 * val;
    px.data[i + 3] = 255;
  }
  ctx.putImageData(px, 0, 0);

  return canvas;
}

function loadDigit(digits, index, container, cb) {
  if (index >= digits.length) {
    return cb();
  }

  new Promise((resolve, reject) => {
    var key = digits[index];
    var data = localStorage.getItem(key);
    if (data) {
      return resolve(JSON.parse(data));
    }

    fetch('/digit/' + key)
      .then(res => res.json())
      .then(json => {
        localStorage.setItem(key, JSON.stringify(json.response));
        resolve(json.response);
      });
  })
    .then(digit => {
      const children = container.children;
      if (children.length === 0) {
        container.appendChild(genCard(digit));
      } else {
        container.insertBefore(genCard(digit), children[0]);
      }

      loadDigit(digits, index + 1, container, cb);
    });
}

function genCard(data) {
  const canvas = drawCanvas(data.pixels, 28, 28);
  const stats = dfrag('li', { className: 'card-toolbar_col', style: 'flex-grow: 5' }, [
    dfrag('div', { className: 'card-toolbar-bar-graph-shell' }, [
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 25%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 75%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 55%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 85%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 25%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 5%' }),
      dfrag('div', { className: 'card-toolbar-bar-graph', style: 'height: 35%' }),
    ]),
  ]);
  const correct = 'correct' in data ? (data.correct ? 'color_prediction-correct' : 'color_prediction-wrong') : 'color_prediction-unset';
  return dfrag('div', { className: 'card card_inline' }, [
    canvas,
    dfrag('ul', { className: `card-toolbar ${correct}`, style: 'position: relative' }, [
      dfrag('li', { style: 'display:none', dataIntent: 'pixels' }, data.pixels),
      dfrag('li', { className: 'card-toolbar_col' }, [
        dfrag('h3', { className: 'card-toolbar-prediction' }, data.prediction || '--'),
      ]),
      dfrag('li', { className: 'card-toolbar-settings', dataIntent: 'settings', style: 'display: none' }, [
        dfrag('button', { dataIntent: 'copy' }, 'Copy')
      ]),
    ]),
  ]);
}

const container = dfrag('div', { className: 'container' });
const loader = dfrag('h1', { className: 'snackbar' });
loader.textContent = 'Loading...';
document.body.appendChild(container);
document.body.appendChild(loader);

function closest(element, selector) {
  if (element === document) {
    return null;
  }

  const match = element.matches(selector);
  if (match) {
    return element;
  }
  return closest(element.parentNode, selector);
}

container.addEventListener('click', (event) => {
  const target = event.target;
  const card = closest(target, '.card');

  if (target.nodeName === 'BUTTON') {
    switch (target.getAttribute('data-intent')) {
      case 'copy':
        console.log('COPY')
        break;
    }
  } else if (target.nodeName === 'CANVAS') {
    const settings = card.querySelector('[data-intent="settings"]');
    settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
  }
});

function load(container) {
  fetch('/digits')
    .then(res => res.json())
    .then(json => {
      loadDigit(json, 0, container, () => {
        document.body.removeChild(loader);
      });
    });
}

function probs() {
  const sample = {
    "pixels": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5294118, 0.9411765, 0.9411765, 0.9411765, 0.9411765, 0.9411765, 0.9411765, 0.64705884, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4973262, 0.9465241, 1, 1, 1, 1, 1, 1, 0.96256685, 0.657754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5508021, 0.9465241, 1, 1, 1, 0.62032086, 0.12834227, 0.45454544, 1, 1, 0.973262, 0.657754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.56149733, 0.9304813, 1, 1, 0.5989305, 0.19251335, 0.10695189, 0, 0.074866295, 0.19251335, 0.44385028, 1, 0.95721924, 0.6631016, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6898396, 1, 1, 0.5828877, 0.12834227, 0, 0, 0, 0, 0, 0.315508, 1, 1, 0.8128342, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5187166, 0.9251337, 1, 0.5828877, 0.11229944, 0, 0, 0, 0, 0, 0, 0.315508, 1, 1, 0.8128342, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6898396, 1, 1, 0.43850267, 0, 0, 0, 0, 0, 0, 0, 0.315508, 1, 1, 0.8128342, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6898396, 1, 1, 0.43850267, 0, 0, 0, 0, 0, 0, 0, 0.315508, 1, 1, 0.8128342, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4705882, 0.88770056, 1, 0.6096257, 0.16577542, 0, 0, 0, 0, 0, 0, 0.19786096, 0.7433155, 1, 0.8449198, 0.30481285, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7540107, 1, 1, 0.37967914, 0, 0, 0, 0, 0, 0, 0.2352941, 0.7433155, 1, 0.88770056, 0.40106952, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7540107, 1, 1, 0.37967914, 0, 0, 0, 0, 0, 0.25133687, 0.72727275, 1, 1, 0.78074867, 0.085561514, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.37967914, 0.8449198, 1, 0.6898396, 0.21925133, 0, 0, 0.25133687, 0.5026738, 0.72192514, 1, 1, 0.8449198, 0.37967914, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6898396, 1, 1, 0.72192514, 0.5026738, 0.5026738, 0.7540107, 1, 1, 1, 0.8449198, 0.3475936, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.33155078, 0.828877, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.6898396, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.33155078, 0.86096257, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.828877, 0.43850267, 0.33155078, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.30481285, 0.8449198, 1, 1, 1, 1, 1, 1, 0.8128342, 0.6256684, 0.7914438, 1, 1, 1, 1, 0.8449198, 0.28342247, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8128342, 1, 1, 1, 1, 1, 0.7914438, 0.6256684, 0.315508, 0, 0.27807486, 0.6256684, 0.6256684, 0.7433155, 1, 1, 0.7540107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.27807486, 0.8716577, 1, 1, 1, 0.7860963, 0.6898396, 0.30481285, 0, 0, 0, 0, 0, 0, 0.2673797, 0.8983957, 1, 0.7540107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.87700534, 1, 1, 0.8128342, 0.7540107, 0.2352941, 0, 0, 0, 0, 0, 0, 0, 0, 0.19786096, 0.74866307, 1, 0.7540107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.21925133, 0.9090909, 1, 0.8128342, 0.19251335, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.315508, 1, 1, 0.7540107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.79679143, 0.98930484, 1, 0.25133687, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.074866295, 0.44385028, 1, 0.96791446, 0.64705884, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.35828876, 0.9304813, 1, 0.3957219, 0.048128366, 0, 0, 0, 0, 0, 0, 0, 0, 0.085561514, 0.4973262, 1, 1, 0.80213904, 0.1550802, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.87700534, 1, 1, 0.3475936, 0.042780757, 0, 0, 0, 0, 0, 0.064171135, 0.12834227, 0.50802135, 1, 1, 0.96256685, 0.657754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7700535, 0.9786096, 1, 1, 0.40106952, 0.12834227, 0.12834227, 0.12834227, 0.12834227, 0.12834227, 0.56684494, 1, 1, 0.95721924, 0.87700534, 0.6042781, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7647059, 0.98930484, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.973262, 0.58823526, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7540107, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.56684494, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6898396, 1, 1, 1, 1, 1, 0.5026738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "percentages": [-12.570901, -5.829284, -0.46901855, 9.744882, 0.7955449, -3.0119429, 3.0356874, -8.918621, 5.1514535, -8.324307],
    "prediction": 3
  };

  function minMax(vals) {
    return vals.reduce((acc, val) => {
      if (val < acc.min) acc.min = val;
      if (val > acc.max) acc.max = val;
      return acc;
    }, { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY });
  }

  function sum(vals) {
    return vals.reduce((acc, val) => acc + val, 0);
  }

  function scale(vals) {
    const { min, max } = minMax(vals);

    console.log({ max, min })
    const oneNth = 1 / vals.length;
    return vals.map(val => {
      if (max === min) return oneNth;
      return (val - min) / (max - min);
    });
  }

  function norm(vals) {
    const _sum = sum(vals);
    return vals.map(val => val / _sum);
  }

  norm(scale(d.percentages)).map(v => Number(v * 100).toFixed(2) * 1)
}

load(container);
