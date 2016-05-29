import * as path from "path";
import * as mkdirp from "mkdirp";
import * as fsn from "fs";
import * as Promise from "bluebird";
let fs = Promise.promisifyAll(fsn);

declare var pathExists: any;

export class UnityProject {
  private _projectPath: string;

  constructor(projectPath: string) {
    this._projectPath = projectPath;
  }

  get projectPath(): string {
    return this._projectPath;
  }

  packageAsync(sourcePaths: string[], outputPath: string): Promise<any> {
    mkdirp.sync(path.dirname(outputPath));

    return new Promise<any>((resolve, reject) => {
      let args = [
        "-batchmode",
          "-nographics",
          "-quit",
          "-projectPath",
          this._projectPath,
          "-exportPackage"
      ];
      args = args.concat(sourcePaths);
      args = args.concat(outputPath);
    });
  }
}