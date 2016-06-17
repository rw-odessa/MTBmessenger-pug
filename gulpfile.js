'use strict';

/* global require */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var nodemon = require('gulp-nodemon');

gulp.task('lint', function() {
  return gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

// start our server and listen for changes
gulp.task('nodemon', function() {
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'server.js',
        // this listens to changes in any of these files/routes and restarts the application
        watch: ["server.js", "./config/config.js", "./views/index.html", "./views/index.pug"],
        ext: 'js,html,pug',
        //nodeArgs: ['--debug'],
        tasks: ['lint']
    }).on('restart', function () {
      console.log('Server restarted!');
    }).on('error', function () {
      console.log('error!');
    });
});

gulp.task('default', function (done) {
  runSequence('lint', 'nodemon', done);
});