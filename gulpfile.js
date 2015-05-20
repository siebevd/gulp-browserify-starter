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
    combineMq = require('gulp-combine-mq'), // Combine all the media queries

    iconfont = require('gulp-iconfont'),
    consolidate = require('gulp-consolidate'),

    settings = {
      DEST_BUILD : './build', // the path the the build folder
      DEST_SRC : './src', // the path to the source folder
      MAIN_JS : '/js/app.js', // the main javascript file
      MAIN_CSS : '/sass/style.scss', // the main sass file
      DIR_FONTS_SVG : '/icons/*.svg', // the path to the svg file to generate fonts
      FONT_NAME : 'iconfont', // the font name
      FONT_CSS_TEMPLATE : '/sass/_tpl/icons.scss', // the template to generate font css
      ICON_CLASS_NAME : 'icn', // the classname that will be given to the icons
      COPY_FILE : ['src/*.html','src/js/vendor/*','src/img/**/**','src/fonts/**/**'], // the folders & files to copy (w/ watch) from src to build folder
      PORT : 3000 // the port for the webserver
    };


/*
 * Server 
 */
gulp.task('webserver', function() {
  gulp.src(settings.DEST_BUILD)
    .pipe(webserver({
      fallback: 'index.html',
      port: settings.PORT
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
    .pipe(gulp.dest(settings.DEST_BUILD + '/js'))
    .pipe(notify({ message: 'Browserify task complete' }));

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
});



/*
 * Copy all files to build folder
 */
gulp.task('copyFiles',copyFiles);

function copyFiles(){
  return gulp.src(settings.COPY_FILE,{base:settings.DEST_SRC})
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
 * Sass
 */

gulp.task('styles', styles);

function styles() {
  gulp.src(settings.DEST_SRC + settings.MAIN_CSS)
    .pipe(plumber({errorHandler: notify.onError("<%= error.fileName %> [<%= error.lineNumber %>]: <%= error.message %>")}))
    .pipe(sass())
    .pipe(prefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(combineMq())
    .pipe(rename({suffix: '.min'})) 
    .pipe(minifyCSS())
    .pipe(gulp.dest(settings.DEST_BUILD + '/css'))
    .pipe(notify({ message: 'Styles task complete' }));
};

/*
 * Generate Icon Font
 */
gulp.task('iconFont',iconFont);

function iconFont(){
  gulp.src([settings.DEST_SRC + settings.DIR_FONTS_SVG])
    .pipe(iconfont({
      fontName: settings.FONT_NAME, // required
      appendCodepoints: true // recommended option
    }))
      .on('codepoints', function(codepoints, options) {
        // CSS templating, e.g.
        gulp.src(settings.DEST_SRC + settings.FONT_CSS_TEMPLATE)
          .pipe(consolidate('lodash', {
            glyphs: codepoints,
            fontName: settings.FONT_NAME,
            fontPath: '../fonts/',
            className: settings.ICON_CLASS_NAME
          }))
          .pipe(gulp.dest(settings.DEST_SRC + '/sass'));
      })
    .pipe(gulp.dest(settings.DEST_BUILD + '/fonts/'))
    .pipe(notify({ message: 'fonts files generated' })); // Send notification
}



/*
 * Gulp Commands
 */

gulp.task('default', ['webserver','iconFont','copyFiles','styles','browserify','watch']);

gulp.task('production',function(callback){
  // sequence it, so the clean one runs before all the rest
  runSequence('clean','iconFont',['styles','brwsrfyMin','copyFiles']);
});


/*
 * Watch Setup
 */

gulp.task('watch', function() {

  // Watch all general files
  watch(settings.COPY_FILE,copyFiles);

  // Watch sass files
  watch(settings.DEST_SRC + '/sass/*.scss',styles);

  // Watch svg files to convert to fonts
  watch(settings.DEST_SRC + settings.DIR_FONTS_SVG ,iconFont);

});