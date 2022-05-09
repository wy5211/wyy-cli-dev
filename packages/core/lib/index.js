module.exports = core;

const colors = require('colors/safe');
const pkg = require('../package.json');
const { log } = require('@wyy-cli-dev/utils');
const { LOWEST_NODE_VERSION } = require('./const');

function core(params) {
  try {
    checkPckVersion();
    checkNodeVersion();
  } catch (e) {
    log.error(e.message);
  }
}

function checkNodeVersion() {
  const semver = require('semver');
  if (semver.gte(LOWEST_NODE_VERSION, process.version)) {
    throw new Error(
      colors.red(`wyy-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`)
    );
  }
}

function checkPckVersion() {
  log.info('version', pkg.version);
}
