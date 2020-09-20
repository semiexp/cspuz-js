const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    library: 'Cspuz',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
	    	loader: 'ts-loader'
      },
      {
        test: /csugar_worker\.js$/,
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback'
        }
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
