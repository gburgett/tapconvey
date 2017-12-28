module.exports = {
  context: __dirname,
  entry: ['babel-polyfill', './index.tsx'],
  output: {
    path: __dirname + '/dist',
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
        loaders: ['babel-loader', 'ts-loader']
      },
      {
        test: /\.json$/,
        loader: 'json'
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
  }
};
