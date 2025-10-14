// metro.config.js — conserva defaults de Expo, bloquea Electron y evita subpaths no exportados
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1) Bloquear electron y electron-builder sin usar 'exclusionList'
config.resolver.blockList = [
  /electron\/.*/,
  /node_modules\/electron\/.*/,
  /node_modules\/electron-builder\/.*/,
];

// 2) Mantener extensiones por defecto y añadir cjs/mjs sin pisarlas
const defaultSourceExts = config.resolver.sourceExts || [];
config.resolver.sourceExts = Array.from(new Set([...defaultSourceExts, 'cjs', 'mjs']));

// 3) Resolver personalizado: bloquear imports de electron SOLO en web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'electron' ||
      moduleName === 'electron-builder' ||
      moduleName.startsWith('electron/'))
  ) {
    return { type: 'empty' };
  }
  return defaultResolver
    ? defaultResolver(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
