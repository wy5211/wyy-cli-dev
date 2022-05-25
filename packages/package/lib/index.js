'use strict';

const pkgDir = require('pkg-dir');
const { isObject, formatPath } = require('@wyy-cli-dev/utils');
const path = require('path');

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
      // package 的name
      packageName,
      // package 的version
      packageVersion,
    } = options || {};
  }

  exists() {}

  install() {}

  getPackage() {}

  // 获取入口文件路径
  getRootFilePath() {
    // 1.获取package.json文件所在的目录，若不存在要一级一级往上找；
    const pkgPath = pkgDir(this.targetPath);
    console.log('pkgPath', pkgPath);

    if (!pkgPath) {
      return null;
    }

    // 2.获取package.json
    const pkgFile = path.resolve(pkgPath, 'package.json');
    // 3.读取package.josn的main/lib
    if (pkgFile && pkgFile?.main) {
      // 4.路径的兼容（macos/windows）
      return formatPath(path.resolve(pkgPath, pkgFile.main));
    }

    return null;
  }

  // 更新 Package
  update() {}
}

module.exports = Package;
