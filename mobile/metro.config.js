const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind v4 disabled for web compatibility
// className prop will be ignored, components must use inline styles via style prop
module.exports = config;
