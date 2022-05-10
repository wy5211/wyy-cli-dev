#!/usr/bin/env node

const importLocal = require('import-local');
const npmlog = require('npmlog');

// 当我们本地node_modules存在一个脚手架命令，同时全局node_modules中也存在这个脚手架命令的时候，优先选用本地node_modules中的版本，防止版本冲突
if (importLocal(__dirname)) {
  npmlog.info('cli', '正在使用本地版本');
} else {
  require('../lib')(process.argv.slice(2));
}
