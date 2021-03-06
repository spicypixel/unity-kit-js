import * as path from "path";
import * as fs from "@spicypixel/core-kit-js/lib/file-system";
import { default as ChildProcess, SpawnOptions } from "@spicypixel/core-kit-js/lib/child-process";
import UnityEditor from "./unity-editor";

declare var pathExists: any;
const spawnOptions: SpawnOptions = { silentUntilError: true };

export default class UnityProject {
  private _projectPath: string;

  constructor(projectPath: string) {
    this._projectPath = projectPath;
  }

  get projectPath(): string {
    return this._projectPath;
  }

  get assetsPath(): string {
    return path.join(this._projectPath, "Assets");
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

    await ChildProcess.spawnAsync(UnityEditor.editorPath, args, spawnOptions);
  }

  async exportPackageAsync(sourcePaths: string[], outputPath: string): Promise<void> {
    await this.verifyProjectExistsAsync();

    await fs.Directory.createRecursiveAsync(path.dirname(outputPath));

    let args = UnityEditor.batchModeArgs;
    args = args.concat(this.projectPathArgs);
    args = args.concat("-exportPackage");
    args = args.concat(sourcePaths);
    args = args.concat(outputPath);

    await ChildProcess.spawnAsync(UnityEditor.editorPath, args, spawnOptions);
  }

  async importPackageAsync(packagePath: string): Promise<void> {
    await this.verifyProjectExistsAsync();

    if (!path.isAbsolute(packagePath))
      packagePath = path.resolve(path.join(this._projectPath, packagePath));

    try {
      await fs.FileSystemRecord.accessAsync(packagePath, fs.FileSystemPermission.Visible);
    } catch (err) {
      throw new Error("Package path does not exist: " + err.message);
    }

    let args = UnityEditor.batchModeArgs;
    args = args.concat(this.projectPathArgs);
    args = args.concat("-importPackage");
    args = args.concat(packagePath);

    await ChildProcess.spawnAsync(UnityEditor.editorPath, args, spawnOptions);
  }

  private async verifyProjectExistsAsync(): Promise<void> {
    try {
      await fs.FileSystemRecord.accessAsync(this._projectPath, fs.FileSystemPermission.Visible);
    } catch (err) {
      throw new Error("Project path does not exist: " + err.message);
    }
  }
}