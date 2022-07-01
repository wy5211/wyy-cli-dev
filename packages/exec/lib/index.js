 'use strict';

const Package = require('@wyy-cli-dev/package');
const { log } = require('@wyy-cli-dev/utils')

module.exports = exec;

const SETTINGS = {
  init: '@wyy-cli-dev/init'
}

function exec(commandName) {

  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();

  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';
const pkg = new Package({
    // package 的目标路径
    targetPath,
    // package 的缓存路径
    // storePath,
    // package 的name
    packageName: commandName,
    // package 的version
    // packageVersion,
  });

  // TODO
}
