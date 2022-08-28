function getProjectTemplate() {
  // 模板需要自己发布到npm上
  return [
    {
      name: 'vue2标准模板',
      npmName: 'imooc-cli-dev-template-vue2',
      version: '1.0.0',
      // 标准模板
      type: 'normal',
    },
    {
      npmName: 'imooc-cli-dev-template-vue-element-admin',
      name: '管理后台模板-vue',
      version: '1.0.0',
      // 自定义模板
      type: 'custom',
    },
    {
      npmName: 'antd',
      name: 'antd',
      version: '3.x',
      // 自定义模板
      type: 'custom',
    },
  ];
}

module.exports = getProjectTemplate;
