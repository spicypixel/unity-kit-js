import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityProject from "./unity-project";

export default class UnityModuleManager {
  private _unityProject: UnityProject;
  private _moduleVendor: string;
  private _moduleName: string;

  private constructor(unityProject: UnityProject, moduleVendor: string, moduleName: string) {
    this._unityProject = unityProject;
    this._moduleVendor = moduleVendor;
    this._moduleName = moduleName;
  }

  static createFromPath(path: string, moduleVendor: string, moduleName: string): UnityModuleManager {
    return new UnityModuleManager(new UnityProject(path), moduleVendor, moduleName);
  }

  static createFromProject(unityProject: UnityProject, moduleVendor: string, moduleName: string): UnityModuleManager {
    return new UnityModuleManager(unityProject, moduleVendor, moduleName);
  }

  get modulePath(): string {
    return path.join(this._unityProject.assetsPath, this._moduleVendor, "Modules", this._moduleName);
  }

  get artifactsPath(): string {
    return path.join(this._unityProject.projectPath, "Artifacts");
  }

  async getPackageFileName(): Promise<string> {
    const pkg = await CoreKit.FileSystem.File.readFileAsync(path.join(this._unityProject.projectPath, "package.json"), "utf8");
    const tag = "v" + JSON.parse(<any>pkg).version;
    return this._moduleVendor + "." + this._moduleName + "-" + tag + ".unitypackage";
  }

  async exportPackageAsync() {
    try {
      await CoreKit.FileSystem.Directory.accessAsync(this.modulePath,
        CoreKit.FileSystem.FileSystemPermission.Visible);
    }
    catch (err) {
      gutil.log("Skipping export Unity package because module folder does not exist: ", this.modulePath);
      return;
    }

    await CoreKit.FileSystem.Directory.createRecursiveAsync(this.artifactsPath);
    await this.cleanArtifactsAsync();
    const packageFileName = await this.getPackageFileName();
    await this._unityProject.exportPackageAsync(
      [path.relative(this._unityProject.projectPath, this.modulePath)],
      path.join(this.artifactsPath, packageFileName));
  }

  async cleanArtifactsAsync() {
    await CoreKit.FileSystem.removePatternsAsync(path.join(this.artifactsPath, "*"));
  }
}