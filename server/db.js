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

function selectDigits(offset, limit, order = [['id', 'DESC']]) {
  return Digit.findAll({ offset, limit, order, attributes: ['id', 'prediction'], group: ['prediction'] });
}

function findDigits(filter) {
  return Digit.findAll(filter);
}

module.exports = {
  insertDigits,
  selectDigits,
  findDigits,
};
