Gulp & Browserify Starter
--------------------------

A basic starter for gulp & browserify projects 


## Including
- Browserify (with .hbs support)
- Handlebars
- Watchify (for fast browserify )
- Sass
    - basic reset 
    - skeleton (http://www.getskeleton.com)
- Webserver


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
- build
- src
    - img
    - js
        - vendor
    - sass
    - index.html
- gulpfile
## Commands
- the default task will startup a server at port 3000 (http://localhost:3000) and run everything unminified on every change you make to the file
``` 
  gulp
``` 

- the production task will clean out the build folder and compile/minify all the files (js,css,images), all the files in the src/js/vendor folder will be copied to build/js/vendor. 
``` 
  gulp production
``` 
