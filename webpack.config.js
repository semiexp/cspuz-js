const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    library: 'Cspuz',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
		loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  plugins: []
};
