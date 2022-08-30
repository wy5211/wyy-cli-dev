const path = require('path');
const { Spinner } = require('cli-spinner');

module.exports = {
  sleep,
  isObject,
  formatPath,
  spinnerStart,
  exec,
  execAsync,
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

function exec(command, args, options) {
  // 兼容 windows
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = exec(command, args, options);
    child.on('error', (e) => {
      reject(e);
    });

    child.on('exit', (e) => {
      resolve(e);
    });
  });
}
