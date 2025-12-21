module.exports = function (api) {
  api.cache(true);

  // Temporarily disable NativeWind babel plugin to fix build
  // TODO: Re-enable once NativeWind v4 + Expo 54 compatibility is resolved
  return {
    presets: ['babel-preset-expo'],
    plugins: [],
  };
};
