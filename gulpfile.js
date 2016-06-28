'use strict';
var path = require('path');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var codecov = require('gulp-codecov');
var exec = require('child_process').exec;
var execOutput = function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
};

gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(excludeGitignore())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('nsp', function (cb) {
    nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('snyk', function () {
    if (!process.env.CI) {
        return;
    }

    exec('snyk test', execOutput);
});

gulp.task('bithound', function () {
    if (!process.env.CI) {
        return;
    }

    exec('bithound check git@github.com:vrtxf/linkedin-profiler.git', execOutput);
});

gulp.task('pre-test', function () {
    return gulp.src([
        'lib/**/*.js',
        'cli/**/*.js'
    ])
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
    var mochaErr;

    process.env.OP_TEST = 1;

    gulp.src('test/**/*.js')
        .pipe(plumber())
        .pipe(mocha({reporter: 'spec'}))
        .on('error', function (err) {
            mochaErr = err;
        })
        .pipe(istanbul.writeReports())
        .on('end', function () {
            cb(mochaErr);
        });
});

gulp.task('codecov', ['test'], function () {
    if (!process.env.COVERAGE_REPORT) {
        return;
    }

    return gulp.src('./coverage/lcov.info')
        .pipe(codecov());
});

gulp.task('stats', ['codecov']);
gulp.task('prepublish', ['nsp', 'snyk', 'bithound']);
gulp.task('default', ['prepublish', 'lint', 'test']);
