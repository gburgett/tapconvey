const path = require('path')
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  context: __dirname,
  entry: ['babel-polyfill', './src/ui/index.tsx'],
  output: {
    path: path.join(__dirname, 'ui'),
    filename: '[name].js'
  },
  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  resolve: {
    // Look for modules in .ts(x) files first, then .js(x)
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  // Add the loader for .ts files.
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        // run through ts-loader then babel, so we transform the jsx
        loaders: ['babel-loader', 'awesome-typescript-loader']
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader?sourceMap',
          'sass-loader?sourceMap'
        ]
      }
    ]
  },
  plugins: [
    new CheckerPlugin()
  ]
};
