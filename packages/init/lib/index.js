const inquirer = require('inquirer');
const Command = require('@wyy-cli-dev/command');
const { log } = require('@wyy-cli-dev/utils');
const fs = require('fs');
const fse = require('fs-extra');
const semver = require('semver');

function isDirEmpty(localPath) {
  const fileList = fs.readdirSync(localPath);
  const validFileList = fileList.filter((item) => {
    return !(item.startsWith('.') || ['node_modules'].includes(item));
  });

  return !validFileList || validFileList.length <= 0;
}

const TYPE_PROJECT = 'TYPE_PROJECT';
const TYPE_COMPONENT = 'TYPE_COMPONENT';

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this.opts.force;
    log.verbose('projectName', this.projectName);
    log.verbose('force', this.force);
  }

  async exec() {
    try {
      // 1.准备阶段
      await this.prepare();
      // 2.下载模板
      // 3.安装模板
    } catch (err) {
      log.error(err.message);
    }
  }

  async prepare() {
    const localPath = process.cwd();
    // 1.判断当前目录是否为空
    if (!isDirEmpty(localPath)) {
      let ifContinue = false;
      if (!this.force) {
        // 1.1询问是否继续创建
        const { continueVal } = await inquirer.prompt({
          type: 'confirm',
          default: false,
          name: 'continueVal',
          message: '当前文件夹不为空，是否继续创建',
        });
        if (!continueVal) {
          return;
        }
        ifContinue = continueVal;
      }

      // 2.是否强制更新
      if (ifContinue || this.force) {
        // 二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          default: false,
          name: 'confirmDelete',
          message: '是否确认清空当前目录下的文件？',
        });
        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }
    return this.getProjectInfo();
  }

  async getProjectInfo() {
    // 1.选择创建项目/组建
    const { type } = await inquirer.prompt({
      name: 'type',
      type: 'list',
      message: '请选择初始化类型',
      default: TYPE_PROJECT,
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
        },
      ],
    });
    log.verbose('type', type);

    // 2.获取项目基本信息
    if (type === TYPE_PROJECT) {
      const o = await inquirer.prompt([
        {
          name: 'projectName',
          type: 'input',
          message: '请输入项目名称',
          default: '',
          validate(v) {
            // 1.输入的首字符必须为英文字符
            // 2.尾字符必须为英文或数字
            // 合法：a, a-b, a_b, a-b-c, a_b_c, a-b1-c1, z_b1_c1
            // 不合法：1， a-, a_, a-1, a_1
            const reg = /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/;

            const done = this.async();

            setTimeout(() => {
              if (!reg.test(v)) {
                done('请输入合法的项目名');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter(v) {
            return v;
          },
        },
        {
          name: 'projectVersion',
          type: 'input',
          message: '请输入项目版本',
          default: '',
          validate(v) {
            const isValid = !!semver.valid(v);
            const done = this.async();
            setTimeout(() => {
              if (!isValid) {
                done('请输入合法的版本号');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter(v) {
            const val = semver.valid(v);
            if (!!val) {
              return val;
            }
            return v;
          },
        },
      ]);
      console.log(o);
    }
  }
}

function init() {
  const argv = [...arguments];
  // TODO
  // console.log('argv', argv);
  return new InitCommand(argv);
}

module.exports.InitCommand = InitCommand;
module.exports = init;
