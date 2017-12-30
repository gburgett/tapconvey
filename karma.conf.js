// Karma configuration
// Generated on Fri Dec 29 2017 21:22:42 GMT-0600 (CST)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/ui/**/*.test.ts',
      'src/ui/**/*.test.tsx'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // add webpack as preprocessor
      'src/ui/**/*.test.ts': ['webpack', 'sourcemap'],
      'src/ui/**/*.test.tsx': ['webpack', 'sourcemap']
    },

    webpack: {
      context: __dirname,
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
      devtool: 'inline-source-map'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
