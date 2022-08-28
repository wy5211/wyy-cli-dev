const log = require('./log');
const npm = require('./npm');
const { isObject, formatPath, spinnerStart, sleep } = require('./utils');

module.exports = {
  sleep,
  spinnerStart,
  formatPath,
  isObject,
  log,
  npm,
};
