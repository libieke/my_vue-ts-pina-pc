module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-typescript', { allExtensions: true, isTSX: false }],
  ],
  plugins: ['babel-plugin-transform-import-meta'],
};
