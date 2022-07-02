'use strict';

const Package = require('@wyy-cli-dev/package');
const { log } = require('@wyy-cli-dev/utils');
const os = require('os');
const path = require('path');

module.exports = exec;

const SETTINGS = {
  init: '@imooc-cli/init',
  // init: 'foo',
};

const CACHE_DIR = 'dependencies';

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  let storeDir = '';
  let pkg;
  const homePath = process.env.CLI_HOME_PATH;

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();

  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  // 未指定 targetPath，动态加载npm模块命令去执行
  if (!targetPath) {
    // 生成缓存路径
    targetPath = path.resolve(os.homedir(), homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('targetPath', targetPath);
    log.verbose('storeDir', storeDir);
    pkg = new Package({
      // package 的目标路径
      targetPath,
      // 缓存路径
      storeDir,
      // package 的name
      packageName,
      // package 的version
      packageVersion,
    });

    if (await pkg.exists()) {
      // 已经缓存，检查是否需要更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
    return;
  }

  // 指定 targetPath，表示执行本地的命令
  pkg = new Package({
    targetPath,
    packageName,
    packageVersion,
  });

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    require(rootFile).apply(null, [...arguments]);
  }
}
