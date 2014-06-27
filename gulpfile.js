var gulp  = require('gulp'),
  gutil   = require('gulp-util'),
  uglify  = require('gulp-uglify'),
  concat  = require('gulp-concat');

gulp.task('distrib', function () {
  gulp.src('./src/*.js')
    .pipe(uglify())
    .pipe(concat('vivus.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.watch('./src/*', function () {
  gulp.run('distrib');
});