"use strict";

import * as gulp from "gulp";
import { TypeScriptBuilder, MochaRunner } from "@spicypixel-private/build-kit-js";
import * as fs from "@spicypixel-private/core-kit-js/lib/file-system";

function clean() {
  return fs.removePatternsAsync(["lib", "test", "test-output"]);
}

async function build() {
  await TypeScriptBuilder.buildAsync();
}

async function rebuild() {
  await clean();
  await build();
}

async function test() {
  await build();
  await MochaRunner.runAsync();
}

// Tasks
gulp.task("default", () => test());
gulp.task("clean", () => clean());
gulp.task("build", () => build());
gulp.task("rebuild", () => rebuild());
gulp.task("test", () => test());