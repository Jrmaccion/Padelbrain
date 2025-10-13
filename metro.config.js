const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude electron directory and node_modules/electron from being bundled
config.resolver.blockList = [
  /electron\/.*/,
  /node_modules\/electron\/.*/,
  /node_modules\/electron-builder\/.*/,
];

// Configure source extensions
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];

// Custom resolver to completely block electron imports on web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block electron and electron-builder on web platform
  if (platform === 'web' && (moduleName === 'electron' || moduleName === 'electron-builder' || moduleName.startsWith('electron/'))) {
    return {
      type: 'empty',
    };
  }

  // Use default resolver for everything else
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
