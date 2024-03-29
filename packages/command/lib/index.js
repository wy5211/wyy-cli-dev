'use strict';
const semver = require('semver');
const colors = require('colors/safe');
const { log, isObject } = require('@wyy-cli-dev/utils');

const LOWEST_NODE_VERSION = '11.0.0';

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组');
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空');
    }
    this._argv = argv;
    const runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());
      chain.catch((err) => {
        log.error(err.message);
      });
    });
  }

  init() {
    throw new Error('init 方法必须实现');
  }

  exec() {
    throw new Error('exec 方法必须实现');
  }

  initArgs() {
    this.opts = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }

  checkNodeVersion() {
    if (semver.gte(LOWEST_NODE_VERSION, process.version)) {
      throw new Error(colors.red(`wyy-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`));
    }
  }
}

module.exports = Command;
