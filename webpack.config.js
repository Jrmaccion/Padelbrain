const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@expo/metro-runtime']
      }
    },
    argv
  );

  // Ensure proper module handling
  config.resolve = config.resolve || {};
  config.resolve.extensions = ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'];

  // Handle node polyfills if needed
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "buffer": false,
  };

  // Ensure proper module type
  config.output = config.output || {};
  config.output.module = true;
  config.experiments = {
    ...config.experiments,
    outputModule: true,
  };

  return config;
};
