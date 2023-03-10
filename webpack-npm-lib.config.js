const path = require("path");

module.exports = {
  mode: 'production',
  entry: './src/npm-lib.ts',
  output: {
    path: path.resolve(__dirname, 'npm-lib'),
    filename: "npm-lib.js",
    libraryTarget: 'umd',
    umdNamedDefine: true,
    clean: true
  },
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  module: {
    rules: [
      {
          test: /\.scss/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
          test: /\.(ts|tsx)?$/,
          use: ['ts-loader'],
          exclude: /node_modules/
      }
    ],
  }
}