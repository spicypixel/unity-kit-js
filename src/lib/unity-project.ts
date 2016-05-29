import * as Bluebird from "bluebird";
import * as path from "path";
import * as mkdirp from "mkdirp";
import { UnityEditor } from "./unity-editor";
import { ChildProcess } from "@spicypixel-private/core-kit-js/dist/lib/child-process";

import * as fsn from "fs";
let fs = Bluebird.promisifyAll(fsn);

declare var pathExists: any;

export class UnityProject {
  private _projectPath: string;

  constructor(projectPath: string) {
    this._projectPath = projectPath;
  }

  get projectPath(): string {
    return this._projectPath;
  }

  get projectPathArgs(): string[] {
    return [
      "-projectPath",
      this._projectPath,
    ];
  }

  packageAsync(sourcePaths: string[], outputPath: string): Promise<any> {
    mkdirp.sync(path.dirname(outputPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat(this.projectPathArgs);
    args = args.concat("-exportPackage");
    args = args.concat(sourcePaths);
    args = args.concat(outputPath);

    return ChildProcess.spawnAsync(UnityEditor.editorPath, args);
  }
}