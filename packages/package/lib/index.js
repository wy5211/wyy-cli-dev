'use strict';

const path = require('path');
const pathExists = require('path-exists').sync;
const npminstall = require('npminstall');
const pkgDir = require('pkg-dir').sync;
const { isObject, formatPath, npm, log } = require('@wyy-cli-dev/utils');
const fse = require('fs-extra');

class Package {
  constructor(options) {
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
      // 缓存路径
      storeDir,
    } = options || {};
    this.targetPath = targetPath;
    this.storeDir = storeDir;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
    // package 缓存前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      // 目录不存在，把目录创建好
      fse.mkdirpSync(this.storeDir);
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await npm.getLatestVersion(this.packageName);
    }
    // console.log('this.packageVersion', this.packageVersion);
  }

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`,
    );
  }

  // 判断当前运行的Package是否存在
  async exists() {
    if (this.storeDir) {
      // 运行第三方模块的包是否存在
      await this.prepare();
      // console.log('this.cacheFilePath', this.cacheFilePath, pathExists(this.cacheFilePath));
      return pathExists(this.cacheFilePath);
    }
    // 运行的本地模块是否存在
    return pathExists(this.targetPath);
  }

  // 安装Package
  install() {
    // 异步
    return npminstall({
      // install root dir
      root: this.targetPath,
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
      registry: npm.getNpmRegistry(),
      storeDir: this.storeDir,
    });
  }

  getSpecificCacheFilePath(version) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${version}@${this.packageName}`,
    );
  }

  // 更新 Package
  async update() {
    // 1.获取最新的npm模块版本号
    const latestPackageVersion = await npm.getLatestVersion(this.packageName);
    // 2.查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    log.verbose('latestFilePath', latestFilePath);
    // 3.如果不存在，直接安装最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: npm.getNpmRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPackageVersion,
          },
        ],
      });
      this.packageVersion = latestPackageVersion;
      return true;
    }
    return false;
  }

  getPackage() {}

  // 获取入口文件路径
  getRootFilePath() {
    function getRootFile(targetPath) {
      // 1.获取package.json文件所在的目录，若不存在要一级一级往上找； npm 模块 -> pkg-dir
      const pkgPath = pkgDir(targetPath);
      if (pkgPath) {
        // 2.获取package.json
        const pkgFile = require(path.resolve(pkgPath, 'package.json'));
        // 3.读取package.josn的 main/lib，输出路径path

        if (pkgFile && pkgFile.main) {
          // 4.路径的兼容（macos/windows）
          return formatPath(path.resolve(pkgPath, pkgFile.main));
        }
      }
      return null;
    }
    if (this.storeDir) {
      // 第三方模块
      return getRootFile(this.cacheFilePath);
    }

    // 本地模块，targetPath
    return getRootFile(this.targetPath);
  }
}

module.exports = Package;
