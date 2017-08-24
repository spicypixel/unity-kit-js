import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityProject from "./unity-project";

export default class UnityModule {
  private _project: UnityProject;
  private _vendor: string;
  private _name: string;

  private constructor(project: UnityProject, vendor: string, name: string) {
    this._project = project;
    this._vendor = vendor;
    this._name = name;
  }

  static createFromPath(path: string, vendor: string, name: string): UnityModule {
    return new UnityModule(new UnityProject(path), vendor, name);
  }

  static createFromProject(unityProject: UnityProject, vendor: string, name: string): UnityModule {
    return new UnityModule(unityProject, vendor, name);
  }

  get project(): UnityProject {
    return this._project;
  }

  get vendor(): string {
    return this._vendor;
  }

  get name(): string {
    return this._name;
  }

  get modulePath(): string {
    return path.join(this._project.assetsPath, this._vendor, "Modules", this._name);
  }

  get artifactsPath(): string {
    return path.join(this._project.projectPath, "Artifacts");
  }

  async getPackageFileName(): Promise<string> {
    const pkg = await CoreKit.FileSystem.File.readFileAsync(
      path.join(this._project.projectPath, "package.json"), "utf8");
    const tag = "v" + JSON.parse(<any>pkg).version;
    return this._vendor + "." + this._name + "-" + tag + ".unitypackage";
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
    await this._project.exportPackageAsync(
      [path.relative(this._project.projectPath, this.modulePath)],
      path.join(this.artifactsPath, packageFileName));
  }

  async cleanArtifactsAsync() {
    await CoreKit.FileSystem.removePatternsAsync(path.join(this.artifactsPath, "*"));
  }
}