var gulp  = require('gulp'),
  gutil   = require('gulp-util'),
  uglify  = require('gulp-uglify'),
  concat  = require('gulp-concat'),
  jshint  = require('gulp-jshint');

gulp.task('distrib', function () {
  gulp.src('./src/*.js')
    .pipe(uglify())
    .pipe(concat('vivus.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.watch('./src/*', function () {
  gulp.run('lint');
});