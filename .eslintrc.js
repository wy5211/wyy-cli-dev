module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'global-require': 0,
    'no-unused-vars': 1,
    'comma-dangle': 0,
    'implicit-arrow-linebreak': 0,
    'arrow-body-style': 0,
  },
};
