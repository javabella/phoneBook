var gulp = require('gulp');
var useref = require('gulp-useref');
var connect = require('gulp-connect');

gulp.task('default', ['ur', 'copy']);

gulp.task('ur', function () {
    var assets = useref.assets();
    
    return gulp.src('app/index.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('copy', function() {
	gulp.src('app/view/*')
		.pipe(gulp.dest('dist/view'));
	gulp.src('app/fonts/*')
		.pipe(gulp.dest('dist/fonts'));
	gulp.src('app/img/*')
		.pipe(gulp.dest('dist/img'));
	gulp.src('app/favicons/*')
		.pipe(gulp.dest('dist'));
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist/',
    port: 8001,
    livereload: false
  });
});

gulp.task('watch', function() {
	gulp.watch(['app/*', 'app/*/*'], ['default']);
});