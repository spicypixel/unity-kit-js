"use strict";

// Tools
var gulp = require("gulp");
var ts = require("gulp-typescript");
var tslint = require("gulp-tslint");
var mocha = require("gulp-mocha");

// Streams and process
var eventStream = require("event-stream");
var sourcemaps = require("gulp-sourcemaps");
let fs = require("fs-extra");

gulp.on("error", function(err) {
  console.log(err);
  process.exit(-1);
});

// Compile TypeScript
gulp.task("tsc", function() {
  var tsProject = ts.createProject("tsconfig.json");

  var lintResult = gulp.src('./src/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report("verbose"));

  var tscResult = tsProject.src()
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(ts(tsProject));

  var dtsResult = tscResult.dts
    .pipe(gulp.dest("./"));

  var jsResult = tscResult.js
    .pipe(sourcemaps.write("./", { includeContent: true, sourceRoot: "../src" }))
    .pipe(gulp.dest("./"));

  return eventStream.merge(lintResult, jsResult, dtsResult);
});

gulp.task("build", ["tsc"]);

gulp.task("default", ["test"]);

gulp.task("test", ["build"], function() {
  return gulp.src("./test/**/*.js", { read: false })
		.pipe(mocha());
});

gulp.task("clean", function() {
  fs.removeSync("lib");
  fs.removeSync("test");
});