const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    library: 'Cspuz',
    libraryTarget: 'var'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
	    	loader: 'ts-loader'
      },
      {
        test: /\.wasm$/,
        loader: 'wasm-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  plugins: [],
  node: {
    fs: 'empty'
  }
};
