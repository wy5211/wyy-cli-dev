const path = require('path');
const { Spinner } = require('cli-spinner');

module.exports = {
  sleep,
  isObject,
  formatPath,
  spinnerStart,
};

function spinnerStart(msg = 'loading', spinnerString = '|/-\\') {
  const spinner = new Spinner(`${msg} %s`);
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

function formatPath(pathUrl) {
  if (!pathUrl) {
    return null;
  }

  // 在 mocos 里面文件路径用 / 拼接，在 windows 上文件路径用 \ 拼接，要兼容一下
  if (path.sep === '/') {
    return pathUrl;
  }
  return pathUrl.replace(/\\/g, '/');
}
