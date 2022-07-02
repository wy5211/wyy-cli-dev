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
    strict: 0,
    'global-require': 0,
    'no-unused-vars': 1,
    'comma-dangle': 0,
    'implicit-arrow-linebreak': 0,
    'arrow-body-style': 0,
    'no-use-before-define': 0,
    'prefer-rest-params': 0,
    'import/no-dynamic-require': 0,
  },
};
