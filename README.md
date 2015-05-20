Gulp & Browserify Starter
--------------------------

A basic starter for gulp & browserify projects 


## Including
- Browserify (with .hbs support) 
- Handlebars
- Watchify (for fast browserify )
- Sass
- Webserver
- generate icon fonts ( gulp-iconfont )


## Get Started
1. Install node ( & npm)
2. Install gulp globally
``` 
  npm install -g gulp
``` 
3. Run Dependencies
``` 
  npm install
``` 

## Structure
- build ( in gitignore )
- src
    - img
    - icons ( svg files to generate font)
    - fonts
    - js
        - vendor
    - sass
    - index.html
- gulpfile

## Icon Font generator

A font will be automatically generated from all the svg's placed inside the ```src/icons``` folder. The font will be put inside the build/fonts folder and a css sass file will be generated (sass/icons.scss). You can configure some of the naming in the fulp file ( look at the gulp settings section ). The template is written in lodash and generates the font face for the font and classes for each seperate icon ( for example if your svg is called arrow.svg -> .icon-arrow).  

## Gulp Settings

You can easily change some of the settings in the gulpfile to your own liking. 

| Name | Description | Default |
|------|-------------|---------|
| `DEST_BUILD` | The path the the build folder | './build' |
| `DEST_SRC` | The path to the source folder | './src' |
| `MAIN_JS` | The main javascript file| '/js/app.js' |
| `MAIN_CSS` |  The main sass file | '/sass/style.scss' |
| `DIR_FONTS_SVG` | The path to the svg file to generate fonts | '/icons/*.svg' |
| `FONT_NAME` | The icon font name | 'iconfont' |
| `FONT_CSS_TEMPLATE` | The template to generate font css | '/sass/_tpl/icons.scss' |
| `ICON_CLASS_NAME` | The classname that will be given to the icons | 'icn' |
| `COPY_FILE` | the folders & files to copy (w/ watch) from src to build folder |  |
| `PORT` | the port for the webserver | 3000 |




## Commands
the default task will startup a server at port 3000 (http://localhost:3000) and run everything unminified on every change you make to the file
``` 
  gulp
``` 

the production task will clean out the build folder and compile/minify all the files (js,css), all the files in the src/js/vendor folder will be copied to build/js/vendor. 
``` 
  gulp production
``` 
