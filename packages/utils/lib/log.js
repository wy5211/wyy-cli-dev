const log = require('npmlog');

// 默认提示层级为 info， info 以下的层级不展示，想要展示更低层级，需要修改 log.level，eg：debug 模式， level 为 verbose
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

log.heading = 'wyy-cli'; // 自定义头部
log.addLevel('success', 2000, { fg: 'green', bold: true }); // 自定义success日志
log.addLevel('notice', 2000, { fg: 'blue', bg: 'black' }); // 自定义notice日志

module.exports = log;
