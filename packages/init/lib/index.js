const Command = require('@wyy-cli-dev/command');
const { log } = require('@wyy-cli-dev/utils');

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = !!this.opts.force;
    log.verbose('projectName', this.projectName);
    log.verbose('force', this.force);
  }
  exec() {
    console.log('init 的业务逻辑');
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
