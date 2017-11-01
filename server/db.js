const Sequelize = require('sequelize');

const config = {
  dialect: 'sqlite',
  storage: `${__dirname}/mnist_db.sqlite`,
};

if (process.env.NODE_ENV !== 'development') {
  config.logging = false;
}

const conn = new Sequelize('mnist_test', '', '', config);

const Digit = conn.define('digit', {
  pixels: {
    type: Sequelize.TEXT,
    get() {
      return JSON.parse(this.getDataValue('pixels'))
    },
    set(pixels) {
      this.setDataValue('pixels', JSON.stringify(pixels))
    },
  },
  percentages: {
    type: Sequelize.TEXT,
    get() {
      return JSON.parse(this.getDataValue('percentages'))
    },
    set(percentages) {
      this.setDataValue('percentages', JSON.stringify(percentages))
    },
  },
  prediction: { type: Sequelize.INTEGER },
  actual: { type: Sequelize.INTEGER },
  model: { type: Sequelize.STRING },
}, {
  timestamps: false
});

function insertDigits(digits) {
  return Digit.sync()
    .then(() => {
      return Digit.bulkCreate(digits, { fields: ['pixels', 'percentages', 'prediction', 'model'] });
    });
}

function fetchSummaries(order = [['id', 'DESC']]) {
  return Digit.findAll({ attributes: ['id'], order })
    .then((rows) => rows.map((row) => row.get('id')));
}

function fetchDigit(id) {
  return Digit.findOne({ where: { id }})
    .then((row) => Object.assign(row.dataValues,
      { pixels: row.get('pixels') },
      { predictions: row.get('predictions') }
    ));
}

module.exports = {
  insertDigits,
  fetchSummaries,
  fetchDigit,
};
