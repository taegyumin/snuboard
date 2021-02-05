// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slsw = require('serverless-webpack');

const { isLocal } = slsw.lib.webpack;

module.exports = {
  mode: isLocal ? 'development' : 'production',
  devtool: 'source-map',
  entry: slsw.lib.entries,
  target: 'node',
  resolve: {
    extensions: ['.mjs', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    devtoolModuleFilenameTemplate: isLocal
      ? path.join(__dirname, '[resource-path]')
      : '../../[resource-path]',
  },
  externals: ['aws-sdk'],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
};
