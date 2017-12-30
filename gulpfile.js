var gulp = require('gulp')
var gutil = require('gulp-util')
var ts = require('gulp-typescript')
var merge = require('merge2')
var webpack = require('webpack')
var fs = require('fs')
var debug = require('gulp-debug')

var appTsproj = ts.createProject({});
var libTsproj = ts.createProject({});

gulp.task('build:app', ['build:lib'], (done) => {
  var tsResult = gulp.src(["src/app/**/*.ts", "!src/app/**/*.test.ts"])
    .pipe(debug())
    .pipe(appTsproj())

  merge([
    tsResult.dts.pipe(gulp.dest('app')),
    tsResult.js.pipe(gulp.dest('app'))
  ])
    .on('error', done)
    .on('end', done)
})

gulp.task('build:lib', (done) => {
  var tsResult = gulp.src(["src/lib/**/*.ts", "!src/lib/**/*.test.ts"])
    .pipe(debug())
    .pipe(libTsproj())

  merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ])
    .on('error', done)
    .on('end', done)
})

gulp.task('build:ui', (done) => {
  options = require('./webpack.config')

  webpack(options, (err, stats) => {
    if (err) {
      done(new gutil.PluginError('webpack', err))
      return
    }

    gutil.log('[webpack]', stats.toString({
      colors: true,
      chunks: false
    }));

    if (stats.hasErrors()) {
      done(new gutil.PluginError('webpack', stats.compilation.errors[0]))
    } else {
      done()
    }
  })
})