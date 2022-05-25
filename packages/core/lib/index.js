const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const { program } = require('commander');
const userHome = require('user-home');
const fs = require('fs');
const { log, npm } = require('@wyy-cli-dev/utils');
const init = require('@wyy-cli-dev/init');
const exec = require('@wyy-cli-dev/exec');
const pkg = require('../package.json');
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME, NPM_NAME } = require('./const');

// const program = new Command();

async function checkGlobalUpdate() {
  // 1.获取npm包的历史版本；2.当前版本与历史最新版本进行对比；3.当前版本小于历史最新版本给出提示；
  const currentVersion = pkg.version;
  const lastestVersion = await npm.getNpmLastestSemverVersion(NPM_NAME, currentVersion);
  if (lastestVersion && semver.gt(lastestVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${NPM_NAME}，当前版本：${currentVersion}，最新版本：${lastestVersion}
                更新命令： npm install -g ${NPM_NAME}`),
    );
  }
}

function createCliConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    process.env.CLI_HOME = DEFAULT_CLI_HOME;
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME);
  }
  return cliConfig;
}

function checkEnv() {
  // dotenv https://juejin.cn/post/6844904198929121288
  const dotenv = require('dotenv');
  dotenv.config({
    path: path.resolve(userHome),
  });
  // console.log(
  //   'dotenv',
  //   dotenv.config({ path: path.resolve(userHome, '.env') }),
  //   process.env
  // );
  createCliConfig(); // 准备基础配置
}

function checkUserHome() {
  // console.log('userHome', userHome); // -> /Users/wangyang
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}

function checkRoot() {
  // root 账户创建的文件没有修改权限，所以需要权限降级
  // 使用 root-check 这个库，实现降级
  // sudo 启动 process.getuid 为 0；
  // console.log(process.getuid()); // -> 0
  const rootCheck = require('root-check');
  rootCheck();
  // console.log(process.getuid()); // -> 501
}

function checkNodeVersion() {
  if (semver.gte(LOWEST_NODE_VERSION, process.version)) {
    throw new Error(colors.red(`wyy-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`));
  }
}

function checkPkgVersion() {
  log.info('version', pkg.version);
}

function registerCommander() {
  const options = program.opts();

  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(`@wyy-cli-dev/cli ${pkg.version}`)
    .option('-d, --debug', '是否开启调试模式', false);

  program
    .command('init <projectName>')
    .description('项目初始化')
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')
    .option('-f, --force', '覆盖当前路径文件（谨慎使用）')
    .action(async (command, { targetPath, force }) => {
      await exec();
    });

  program.on('option:debug', () => {
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('已开启debug模式');
  });

  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((item) => item.name());
    console.log(colors.red(`未知命令：${obj[0]}，可用的命令 ${availableCommands.join(',')}`));
  });

  program.on('option:targetPath', (targetPath) => {
    // console.log('wy->a', targetPath);
    process.env.CLI_TARGET_PATH = targetPath;
  });

  program.parse(process.argv);

  // const options = program.opts();
  // console.log('options', options);
}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  // 开发注释提速
  // await checkGlobalUpdate();
}

async function core() {
  try {
    prepare();
    registerCommander();
  } catch (e) {
    log.error(e.message);
  }
}

module.exports = core;

// function checkArgs(args) {
//   if (args.debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   } else {
//     process.env.LOG_LEVEL = 'info';
//   }
//   log.level = process.env.LOG_LEVEL;
// }

// function checkInputArgs() {
//   log.verbose('开始校验输入参数');
//   const minimist = require('minimist');
//   const args = minimist(process.argv.slice(2)); // 解析查询参数
//   checkArgs(args); // 校验参数
//   log.verbose('输入参数', args);
// }
