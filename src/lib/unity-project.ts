import * as Bluebird from "bluebird";
import * as path from "path";
import { UnityEditor } from "./unity-editor";
import ChildProcess from "@spicypixel-private/core-kit-js/lib/child-process";

import * as fsBase from "fs-extra";
let fs = <any>Bluebird.promisifyAll(fsBase);

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

  createAsync(): Promise<any> {
    fs.mkdirpSync(path.dirname(this._projectPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat("-createProject");
    args = args.concat(this._projectPath);

    return ChildProcess.spawnAsync(UnityEditor.editorPath, args).catch((err) => {
      console.log("ERROR Spawning: " + UnityEditor.editorPath + " " + args.join(" "));
      throw err;
    });
  }

  packageAsync(sourcePaths: string[], outputPath: string): Promise<any> {
    this.verifyProjectExists();

    fs.mkdirpSync(path.dirname(outputPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat(this.projectPathArgs);
    args = args.concat("-exportPackage");
    args = args.concat(sourcePaths);
    args = args.concat(outputPath);

    return ChildProcess.spawnAsync(UnityEditor.editorPath, args);
  }

  private verifyProjectExists(): void {
    if (!fs.existsSync(this.projectPath))
      throw new Error("Project path does not exist");
  }
}