module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: ["airbnb-base"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "linebreak-style": ["off", "windows"],
    'no-await-in-loop': ['off'],
    'no-loop-func': ['off']
  }
};
