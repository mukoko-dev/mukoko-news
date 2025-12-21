module.exports = function (api) {
  api.cache(true);

  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: [
      isTest ? ['babel-preset-expo', { jsxRuntime: 'automatic' }] : 'babel-preset-expo'
    ],
    plugins: isTest ? [] : ['nativewind/babel'],
    env: {
      test: {
        plugins: [],
      },
    },
  };
};
