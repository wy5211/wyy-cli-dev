const inquirer = require('inquirer');
const Command = require('@wyy-cli-dev/command');
const { log, spinnerStart, sleep } = require('@wyy-cli-dev/utils');
const fs = require('fs');
const fse = require('fs-extra');
const semver = require('semver');
const path = require('path');
const os = require('os');
const Package = require('@wyy-cli-dev/package');
const getProjectTemplate = require('./getProjectTemplate');

const userHome = os.homedir();

const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';

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
      const projectInfo = await this.prepare();
      this.projectInfo = projectInfo;
      log.verbose('projectInfo', projectInfo);
      // 2.下载模板
      await this.downloadTemplate();
      // 3.安装模板
      await this.installTemplate();
    } catch (err) {
      log.error(err.message);
    }
  }

  async installTemplate() {
    log.verbose('this.choicedTemplateInfo', this.choicedTemplateInfo);
    if (!this.choicedTemplateInfo) {
      throw new Error('无法识别项目模板类型');
    }
    if (!this.choicedTemplateInfo.type) {
      this.choicedTemplateInfo.type = TEMPLATE_TYPE_NORMAL;
    }
    if (this.choicedTemplateInfo.type === TEMPLATE_TYPE_NORMAL) {
      await this.installNormalTemplate();
      return;
    }
    if (this.choicedTemplateInfo.type === TEMPLATE_TYPE_CUSTOM) {
      await this.installCustomTemplate();
      return;
    }
    throw new Error('项目模板类型不存在');
  }

  installNormalTemplate() {
    const spinner = spinnerStart('正在安装模板...');

    try {
      const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
      const targetPath = process.cwd();
      fse.ensureDirSync(templatePath);
      fse.ensureDirSync(targetPath);
      fse.copySync(templatePath, targetPath);
    } catch (e) {
      throw e;
    } finally {
      spinner.stop(true);
    }
  }

  installCustomTemplate() {
    console.log('custom template');
  }

  async downloadTemplate() {
    // console.log('this.projectInfo', this.projectInfo, 'this.template', this.template);
    const { projectTemplate } = this.projectInfo;
    const choicedTemplateInfo = this.template.find((item) => item.npmName === projectTemplate);
    this.choicedTemplateInfo = choicedTemplateInfo;

    const { npmName, version } = choicedTemplateInfo;
    const targetPath = path.resolve(userHome, '.wyy-cli', 'template');
    const storeDir = path.resolve(userHome, '.wyy-cli', 'template', 'node_modules');
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    this.templateNpm = templateNpm;

    if (!(await templateNpm.exists())) {
      try {
        // const spinner = spinnerStart('正在下载模板...');
        // 不存在，安装
        await templateNpm.install();
        // spinner.stop(true);
      } catch (e) {
        throw e;
      } finally {
        if (await templateNpm.exists()) {
          log.success('下载模板成功');
        }
      }
    } else {
      // 存在，更新
      await templateNpm.update();
      // const spinner = spinnerStart('正在更新模板...');
      // spinner.stop(true);
      if (await templateNpm.exists()) {
        log.success('更新模板成功');
      }
    }

    // 1.通过项目模板API获取项目模板信息
    // 1.1通过egg.js搭建一套后端系统
    // 1.2通过npm存储项目模板
    // 1.3将项目模板信息存储到mongodb数据库中
    // 1.4通过egg.js获取mongodb中的数据并且通过API返回
  }

  async prepare() {
    // 0.判断项目模板是否存在
    this.template = await getProjectTemplate();
    if (!this.template && this.template?.length === 0) {
      throw new Error('项目模板不存在');
    }
    // console.log(this.template);
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
    // 1.选择创建项目/组件
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
      const projectInfo = await inquirer.prompt([
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
          default: '1.0.0',
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
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模板',
          choices: this.createTemplateChoice(this.template),
        },
      ]);
      // console.log(projectInfo);
      return {
        ...projectInfo,
        type,
      };
    }
  }

  createTemplateChoice(list) {
    return list.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
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
