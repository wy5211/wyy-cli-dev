'use strict';

const pkgDir = require('pkg-dir');
const { isObject } = require('@wyy-cli-dev/utils');

class Package {
  constructor(options) {
    console.log('package init');
    if (!options) {
      throw new Error('Package 的初始化参数不可为空！');
    }
    if (!isObject(options)) {
      throw new Error('Package 的初始化参数必须为对象！');
    }
    const {
      // package 的目标路径
      targetPath,
      // package的存储路径
      storePath,
      // package 的name
      packageName,
      // package 的version
      packageVersion,
    } = options || {};
    this.targetPath = targetPath;
    this.storePath = storePath;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
  }

  // 判断当前Package是否存在
  exists() {}

  // 安装Package
  install() { }
  
  // 更新 Package
  update() {}

  getPackage() {}

  // 获取入口文件路径
  getRootFilePath() {
    // 1.获取package.json文件所在的目录，若不存在要一级一级往上找；
    const pkgPath = pkgDir(this.targetPath);
    console.log('pkgPath', pkgPath);
    // 2.获取package.json
    // 3.读取package.josn的main/lib
    // 4.路径的兼容（macos/windows）
  }
}

module.exports = Package;
