var gulp      = require('gulp'),
  gulpImports = require('gulp-imports'),
  gutil       = require('gulp-util'),
  uglify      = require('gulp-uglify'),
  concat      = require('gulp-concat'),
  jshint      = require('gulp-jshint');

/**
 * distrib
 * Build the final scripts: `vivus.js` and `vivus.min.js`
 *
 */
gulp.task('distrib', function () {
  gulp.src('./src/_build.js')
    .pipe(gulpImports())

    .pipe(concat('vivus.js'))
    .pipe(gulp.dest('./dist'))

    .pipe(concat('vivus.min.js'))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('./dist'));
});


/**
 * lint
 * run JShint on the scripts
 *
 */
gulp.task('lint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

/**
 * develop
 * Task to develop, it run a watch which pass JShint and build
 * the final scripts.
 * 
 */
gulp.task('develop', function() {
  gulp.watch('./src/*', function () {
    gulp.run('lint', 'distrib');
  });
});
