module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Alias @/ → ./src
      ['module-resolver', { root: ['./'], alias: { '@': './src' } }],

      // Plugin local para neutralizar import.meta / import.meta.env en libs “vite-friendly”
      require('./babel-plugin-replace-import-meta'),
    ],
  };
};
