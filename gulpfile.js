var browserify = require('browserify'),
    source = require('vinyl-source-stream'), // Transforming browserify so we can use it with gulp
    watchify = require('watchify'),
    buffer = require('vinyl-buffer'),
    del = require('del'), // Clear out files & folders
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'), // Fixes watch task on error 
    webserver = require('gulp-webserver'), // Server 
    notify = require('gulp-notify'), // Get Mac Notifications when a task is finished
    imagemin = require('gulp-imagemin'),
    prefixer = require('gulp-autoprefixer'), // Prefix css with different browser stuff
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-minify-css'),
    runSequence = require('run-sequence'), // Run tasks in sequence instead of parallel
    pngquant = require('imagemin-pngquant'),
    assign = require('lodash.assign'),
    uglify = require('gulp-uglify');


/*
 * Basic Setup -- DEV
 */

gulp.task('webserver', function() {
  gulp.src('build')
    .pipe(webserver({
      fallback: 'index.html',
      port: 3000
    }));
});

gulp.task('styles', function() {
  gulp.src('src/sass/style.scss')
    .pipe(plumber({errorHandler: notify.onError("<%= error.fileName %> [<%= error.lineNumber %>]: <%= error.message %>")}))
    .pipe(sass())
    .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({suffix: '.min'})) 
    .pipe(gulp.dest('build/css'))
    .pipe(notify({ message: 'Styles task complete' }));
});


/*
 * Browserify
 */


var browserifyOpts = {
  entries: './src/js/app.js',
  extensions: ['.hbs'], 
  debug:true
};

var opts = assign({}, watchify.args, browserifyOpts);
var b = watchify(browserify(opts));


gulp.task('browserify',brwsrfy);
b.on('update', brwsrfy);
b.on('log', gutil.log); // output build logs to terminal


function brwsrfy() {
  return b.bundle()
    .on("error", notify.onError(function (error) {
      return "ERROR: " + error.message;
      this.emit('end');
    }))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'));
}


/*
 * Basic Setup -- Production 
 */


gulp.task('html',function(){
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('build/'))
    .pipe(notify({ message: 'Html files moved' })); // Send notification
});

gulp.task('vendorJs',function(){
  return gulp.src(['src/js/vendor/*'])
    .pipe(gulp.dest('build/js/vendor/'))
    .pipe(notify({ message: 'Javascript Vendor files moved' })); // Send notification
});

gulp.task('img',function(){
  return gulp.src(['src/img/*'])
    .pipe(gulp.dest('build/img/'))
    .pipe(notify({ message: 'Image files moved' })); // Send notification
});

gulp.task('clean',function(cb){
    del(['build/**'], cb);
});


gulp.task('browserifyMin', function () {
  return browserify(browserifyOpts).bundle()
    .on("error", notify.onError(function (error) {
      return "ERROR: " + error.message;
      this.emit('end');
    }))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/js'));
});




gulp.task('stylesMin', function() {
  gulp.src('src/sass/style.scss')
    .pipe(plumber({errorHandler: notify.onError("<%= error.fileName %> [<%= error.lineNumber %>]: <%= error.message %>")}))
    .pipe(sass())
    .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'})) 
    .pipe(gulp.dest('build/css'))
    .pipe(notify({ message: 'Styles task complete -- Minified' }));
});


gulp.task('img-resize', function () {
    return gulp.src('src/img/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/img'));
});


/*
 * Gulp Commands
 */

gulp.task('default', ['webserver','html','img','vendorJs','styles','browserify','watch']);

gulp.task('production',function(callback){
  // sequence it, so the clean one runs before all the rest
  runSequence('clean',['html','stylesMin','browserifyMin','img-resize','vendorJs']);
});


/*
 * Watch Setup
 */

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('src/sass/*.scss',['styles']); 

  // Watch .js files
  gulp.watch('src/js/**',['browserify']);

  // Watch .html files
  gulp.watch('src/*.html',['html']);

  // Watch img files
  gulp.watch('src/img/*',['img']);

  // Watch js vendor files
  gulp.watch('src/js/vendor/*',['vendorJs']);
});