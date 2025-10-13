module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { root: ['./'], alias: { '@': './src' } }],
      // Custom plugin to replace import.meta with safe alternatives
      './babel-plugin-replace-import-meta.js',
    ],
    env: {
      production: {
        plugins: ['react-native-web']
      }
    }
  };
};
