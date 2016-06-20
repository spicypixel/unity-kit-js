import Promise from "@spicypixel/core-kit-js/lib/promise";
import * as path from "path";
import * as fs from "@spicypixel/core-kit-js/lib/file-system";
import ChildProcess from "@spicypixel/core-kit-js/lib/child-process";
import UnityEditor from "./unity-editor";

declare var pathExists: any;

export default class UnityProject {
  private _projectPath: string;

  constructor(projectPath: string) {
    this._projectPath = projectPath;
  }

  get projectPath(): string {
    return this._projectPath;
  }

  private get projectPathArgs(): string[] {
    return [
      "-projectPath",
      this._projectPath,
    ];
  }

  async createAsync(): Promise<void> {
    await fs.Directory.createRecursiveAsync(path.dirname(this._projectPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat("-createProject");
    args = args.concat(this._projectPath);

    await ChildProcess.spawnAsync(UnityEditor.editorPath, args, { stdio: ["pipe", "ignore", process.stderr] });
  }

  async packageAsync(sourcePaths: string[], outputPath: string): Promise<void> {
    await this.verifyProjectExistsAsync();

    await fs.Directory.createRecursiveAsync(path.dirname(outputPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat(this.projectPathArgs);
    args = args.concat("-exportPackage");
    args = args.concat(sourcePaths);
    args = args.concat(outputPath);

    await ChildProcess.spawnAsync(UnityEditor.editorPath, args, { stdio: ["pipe", "ignore", process.stderr] });
  }

  private async verifyProjectExistsAsync(): Promise<void> {
    try {
      await fs.FileSystemRecord.accessAsync(this._projectPath, fs.FileSystemPermission.Visible);
    } catch (err) {
      throw new Error("Project path does not exist: " + err.message);
    }
  }
}