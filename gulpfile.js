'use strict';


var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');


gulp.task('build', function() {
    gulp.src('./lib/parser.js')
        .pipe(browserify({
          debug : true
        }))
        .pipe(rename({
          basename: 'cron-dev'
        }))
        .pipe(gulp.dest('./browser'))
});

gulp.task('minify', function() {
    gulp.src('./lib/parser.js')
        .pipe(browserify({
          debug : false
        }))
        .pipe(uglify({
          preserveComments: function () {
            return false;
          }
        }))
        .pipe(rename({
          basename: 'cron-dist'
        }))
        .pipe(gulp.dest('./browser'))
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['browser']));

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('build', 'minify', cb);
});

