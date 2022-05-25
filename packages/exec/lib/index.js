'use strict';

const Package = require('@wyy-cli-dev/package');

module.exports = exec;
function exec(commandName, options, command) {
  console.log('ooo', command.parent.opts());
  const { targetPath } = options || {};

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

  console.log('process.env.CLI_HOME', process.env.CLI_HOME);
  console.log('process.env.CLI_TARGET_PATH', process.env.CLI_HOME);
  // TODO
}
