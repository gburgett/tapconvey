var gulp = require('gulp')
var ts = require('gulp-typescript')
var merge = require('merge2')
var webpack = require('webpack-stream')
var fs = require('fs')
var debug = require('gulp-debug')

var appTsproj = ts.createProject('tsconfig.json');
var libTsproj = ts.createProject('tsconfig.json');

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
  options = require('./src/ui/webpack.config')

  return gulp.src(['src/ui/**/*.ts', "!src/ui/**/*.test.ts", '!src/**/_*'])
    .pipe(webpack(options))
    .pipe(gulp.dest('ui'))
    .on('end', done)
})