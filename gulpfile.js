var gulp = require('gulp')
var ts = require('gulp-typescript')
var merge = require('merge2')

var proj = ts.createProject('tsconfig.json');

gulp.task('build:src', (done) => {
  var tsResult = gulp.src("src/**/*.ts", "!src/**/*.test.ts", "index.ts")
    .pipe(tsProject());

  return merge([
    tsResult.dts.pipe(gulp.dest('lib')),
    tsResult.js.pipe(gulp.dest('lib'))
  ]);
})