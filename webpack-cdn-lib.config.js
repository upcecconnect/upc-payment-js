const path = require("path");

module.exports = {
  mode: 'production',
  entry: './src/cdn-lib.ts',
  output: {
    filename: "upc-payment.js",
    path: path.resolve(__dirname, 'cdn-lib'),
    clean: true
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