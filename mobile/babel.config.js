module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    // Note: NativeWind v4 styling is handled by Metro transformer (metro.config.js withNativeWind)
    // not by a Babel plugin. The className prop transformation happens via react-native-css-interop.
  };
};
