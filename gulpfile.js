var gulp = require('gulp');
var babel = require('gulp-babel');
var mocha = require('gulp-mocha-co');
var env = require('gulp-env');
var runSequence = require('run-sequence');
var spawn = require('child_process').spawn;
var node;

gulp.task('test', function() {
    return gulp
        .src('tests/**/*.js')
        .pipe(env.set({
            NODE_ENV: 'test',
        }))
        .pipe(mocha({
            ui: 'tdd',
            reporter: 'nyan',
            timeout: 5000,
        }));
});

gulp.task('build', function() {
    return gulp
        .src('js/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('server', function() {
    if(node) node.kill();
    node = spawn('node', ['dist/api.js'], {stdio: 'inherit'});
    node.on('close', function(code) {
        if(code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('watch', function() {
    runSequence('build', 'server');

    gulp.watch(['js/**/*.js'], function() {
        runSequence('build', 'server');
    });
});

process.on('exit', function() {
    if(node) node.kill();
});
