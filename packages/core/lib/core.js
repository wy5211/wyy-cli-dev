#!/usr/bin/env node

const yargs = require('yargs/yargs');
const dedent = require('dedent');
const pkg = require('../package.json');
const argv = process.argv.splice(2);

const context = {
  wyyVersion: pkg.version,
};

const cli = yargs();

cli
  // $0 会拿到 bin 下面的命令名称
  .usage('Usage: $0 [command] <options>')
  // 命令错误时候，提示类似的命令到shell窗口
  .recommendCommands()
  .demandCommand(1, '最少输入一个参数')
  // 严格模式，有无法识别的参数会给出提示
  .strict()
  .alias('h', 'help')
  .alias('v', 'version')
  // 全局 Options 添加选项
  .options({
    debug: {
      // 添加的选项名
      type: 'boolean',
      describe: 'debug mode',
      alias: 'd', // 别名
    },
  })
  // 选项分组
  .group(['debug'], 'Dev Options:')
  // 定义单个的 option
  .option('registry', {
    alias: 'r',
    type: 'string',
    description: 'Define global registry',
    // 是否隐藏
    // hidden: false
  })
  .command(
    // init 脚手架后面输入的名，[name]定义的option
    'init [name]',
    // 命令描述
    'Define name for a project',
    // builder，在执行这个command之前做的事情
    (yargs) => {
      yargs.option('name', {
        type: 'string',
        describe: 'init的option',
        alias: 'n',
      });
    },
    // handler，执行comand 的行为
    (argv) => {
      console.log('argv', argv);
    }
  )
  // 对象形式的定义
  .command({
    command: 'list',
    aliases: ['ls', 'la', 'll'],
    describe: 'list 的描述',
    builder: (yargs) => {},
    handler: (argv) => {
        console.log(argv);
        const chain = Promise.resolve();
        chain.then(() => console.log('123'));
    },
  })
  // terminalWidth返回当前shell窗口的宽度
  .wrap(cli.terminalWidth())
  // 设置结尾显示的内容
  .epilogue(
    dedent`
  When a command fails, all logs are written to lerna-debug.log in the current working directory.

  For more information, find our manual at https://github.com/lerna/lerna
`
  )
  // 命令有误，错误提示
  .fail((msg, err) => {
    console.log(msg);
  })
  // 解析命令参数，合并传入的参数，合并完作为一个新的参数注入到脚手架中
  .parse(argv, context);
