const gulp = require("gulp");  
const babel = require("gulp-babel");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require("browserify");  
  
gulp.task("default", function () {
	browserify({
		entries:["./src/wb.js"]
	})
	.transform('babelify',
	{
		presets : ['es2015']
	})  
    // .pipe(babel({  
    //     presets: ['es2015']  
    // }))
    .bundle() 
    .pipe(source('wb.js'))
    .pipe(buffer())  
    .pipe(gulp.dest("./dist")); //转换成 ES5 存放的路径  
});