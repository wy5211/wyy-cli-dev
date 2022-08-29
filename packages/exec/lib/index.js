'use strict';

const Package = require('@wyy-cli-dev/package');
const { log } = require('@wyy-cli-dev/utils');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const SETTINGS = {
  // 需要是发布到 npm 上的包
  init: '@imooc-cli/init',
  // init: 'foo',
};
const userHome = os.homedir();

const CACHE_DIR = 'dependencies';

async function exec() {
  // 是否指定本地调试文件
  let targetPath = process.env.CLI_TARGET_PATH;
  let storeDir = '';
  let pkg;
  const homePath = process.env.CLI_HOME_PATH;

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();

  // console.log('opts', arguments[0], cmdObj.opts(), 'parentsOpts', cmdObj.parent.opts());

  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  // 未指定 targetPath，动态加载npm模块命令去执行
  if (!targetPath) {
    // 生成缓存路径
    targetPath = path.resolve(userHome, homePath, CACHE_DIR);
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
    try {
      const opts = {
        ...arguments[1],
        ...cmdObj.parent.opts(),
      };

      // console.log('opts', opts);

      const code = `require('${rootFile}').apply(null, ${JSON.stringify([arguments[0], opts])})`;
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      child.on('error', (e) => {
        log.error(e.message);
        process.exit(1);
      });

      child.on('exit', (e) => {
        log.verbose('命令执行成功');
        process.exit(e);
      });
    } catch (err) {
      log.error(err.message);
    }
  }
}

function spawn(command, args, options) {
  // 兼容 windows
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
