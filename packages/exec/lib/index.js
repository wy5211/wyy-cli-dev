'use strict';

const Package = require('@wyy-cli-dev/package');

module.exports = exec;
function exec() {
  const commandObj = arguments[arguments.length - 1];
  console.log('commandObj', commandObj.targetPath);

  const pkg = new Package({
    // package 的目标路径
    // targetPath: commandObj.,
    // package 的缓存路径
    // storePath,
    // package 的name
    // packageName,
    // package 的version
    // packageVersion,
  });

  console.log('process.env.CLI_HOME', process.env.CLI_HOME);
  console.log('process.env.CLI_TARGET_PATH', process.env.CLI_HOME);
  // TODO
}
