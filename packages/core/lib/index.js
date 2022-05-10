const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const { Command } = require('commander');
const userHome = require('user-home');
const fs = require('fs');
const { log, npm } = require('@wyy-cli-dev/utils');
const init = require('@wyy-cli-dev/init');
const pkg = require('../package.json');
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME, NPM_NAME } = require('./const');

const program = new Command();

let config;

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
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME);
  }
  return cliConfig;
}

function checkEnv() {
  log.verbose('开始检查环境变量');
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
  config = createCliConfig(); // 准备基础配置
  log.verbose('环境变量', config);
}

function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkInputArgs() {
  log.verbose('开始校验输入参数');
  const minimist = require('minimist');
  const args = minimist(process.argv.slice(2)); // 解析查询参数
  checkArgs(args); // 校验参数
  log.verbose('输入参数', args);
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
  console.log('123');

  // program
  //   .option('-d, --debug', 'output extra debugging')
  //   .option('-s, --small', 'small pizza size')
  //   .option('-p, --pizza-type <type>', 'flavour of pizza');

  // program.parse(process.argv);

  // const options = program.opts();
  // if (options.debug) console.log(options);
  // console.log('pizza details:');
  // if (options.small) console.log('- small pizza size');
  // if (options.pizzaType) console.log(`- ${options.pizzaType}`);

  // return;
  const options = program.opts();

  program.version(pkg.version).usage('<command> [options]');

  program.option('-d, --debug', 'output extra debugging');

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

  program
    .command('init [projectName]')
    .description('项目初始化')
    .option('-f, --force', '覆盖当前路径文件（谨慎使用）')
    .action(init);

  //   // 没有输入有效的命令；
  //   program.outputHelp();

  program.parse(process.argv);
}

async function core(params) {
  try {
    // checkPkgVersion();
    // checkNodeVersion();
    // checkRoot();
    // checkUserHome();
    // checkInputArgs();
    // checkEnv();
    // await checkGlobalUpdate();
    registerCommander();
  } catch (e) {
    log.error(e.message);
  }
}

module.exports = core;
