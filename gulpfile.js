var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webserver = require('gulp-webserver'), // Server 
    del = require('del'), // Clear out files & folders
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'), // Fixes watch task on error 
    notify = require('gulp-notify'), // Get Mac Notifications when a task is finished
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'), // Run tasks in sequence instead of parallel
    changed = require('gulp-changed'),

    source = require('vinyl-source-stream'), // Transforming browserify so we can use it with gulp
    watchify = require('watchify'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    assign = require('lodash.assign'),
    uglify = require('gulp-uglify'),
    stripDebug = require('gulp-strip-debug'),

    
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'), // Prefix css with different browser stuff
    minifyCSS = require('gulp-minify-css'),

    settings = {
      DEST_BUILD : './build',
      DEST_SRC : './src',
      MAIN_JS : '/js/app.js',
      MAIN_CSS : '/sass/style.scss',
      COPY_FILE : ['src/*.html','src/js/vendor/*','src/img/**/**'],
      PORT : 3000
    };


/*
 * Server 
 */
gulp.task('webserver', function() {
  gulp.src(settings.DEST_BUILD)
    .pipe(webserver({
      fallback: 'index.html',
      port: settings.port
    }));
});


/*
 * Browserify
 */
var browserifyOpts = {
  entries: settings.DEST_SRC + settings.MAIN_JS,
  extensions: ['.hbs'], 
  debug:true
};


// Add watchify to browserify to speed up compile when developing
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
    .pipe(source('app.js')) // Give the new file the name app.js
    .pipe(buffer()) // Transform it back to gulp readable stuff
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(settings.DEST_BUILD + '/js'));
}

gulp.task('brwsrfyMin',function() {
  return b.bundle()
    .on("error", notify.onError(function (error) {
      return "ERROR: " + error.message;
      this.emit('end');
    }))
    .pipe(source('app.js')) // Give the new file the name app.js
    .pipe(buffer()) // Transform it back to gulp readable stuff
    .pipe(uglify())
    .pipe(stripDebug())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(settings.DEST_BUILD + '/js'));
}



/*
 * Copy all files to build folder
 */
gulp.task('copyFiles',copyFiles);

function copyFiles(){
  return gulp.src(settings.COPY_FILE,{base:'src'})
      .pipe(changed(settings.DEST_BUILD))
      .pipe(notify({ message: 'File Moved' }))
      .pipe(gulp.dest(settings.DEST_BUILD));
};


/*
 * Clean out the build directory
 */

gulp.task('clean',function(cb){
    del([settings.DEST_BUILD+'/**'], cb);
});


/*
 * Css
 */

gulp.task('styles', styles);

function styles() {
  gulp.src(settings.DEST_SRC + settings.MAIN_CSS)
    .pipe(plumber({errorHandler: notify.onError("<%= error.fileName %> [<%= error.lineNumber %>]: <%= error.message %>")}))
    .pipe(sass())
    .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename({suffix: '.min'})) 
    .pipe(minifyCSS())
    .pipe(gulp.dest(settings.DEST_BUILD + '/css'))
    .pipe(notify({ message: 'Styles task complete' }));
};




/*
 * Gulp Commands
 */

gulp.task('default', ['webserver','copyFiles','styles','browserify','watch']);

gulp.task('production',function(callback){
  // sequence it, so the clean one runs before all the rest
  runSequence('clean',['styles','brwsrfyMin','copyFiles']);
});


/*
 * Watch Setup
 */

gulp.task('watch', function() {

  // Watch all general files
  watch(settings.COPY_FILE,copyFiles);

  // Watch sass files
  watch(settings.DEST_SRC + '/sass/*.scss',styles); 

});