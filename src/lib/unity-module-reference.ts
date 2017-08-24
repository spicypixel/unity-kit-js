import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityProject from "./unity-project";

export default class UnityModuleReference {
  private _project: UnityProject;
  private _moduleProject: UnityProject;
  private _moduleVendor: string;
  private _moduleName: string;

  private constructor(project: UnityProject, moduleProject: UnityProject, moduleVendor: string, moduleName: string) {
    this._project = project;
    this._moduleProject = moduleProject;
    this._moduleVendor = moduleVendor;
    this._moduleName = moduleName;
  }

  static createFromNodeModule(project: UnityProject, nodeScope: string, nodeModuleName: string, moduleVendor: string, moduleName: string): UnityModuleReference {
    const dependencyManager = new BuildKit.DependencyManager();
    const nodeDir = dependencyManager.getNodeModuleDir (nodeScope, nodeModuleName);
    const moduleProject = new UnityProject(nodeDir);
    return new UnityModuleReference(project, moduleProject, moduleVendor, moduleName);
  }

  get referencePath(): string {
    return path.resolve(path.join(this._moduleProject.assetsPath, this._moduleVendor, "Modules", this._moduleName));
  }

  get installPath(): string {
    return path.resolve(path.join(this._project.assetsPath, this._moduleVendor, "Modules", this._moduleName));
  }

  get artifactsPath(): string {
    return path.join(this._moduleProject.projectPath, "Artifacts");
  }

  async installAsync() {
    if (this.referencePath === this.installPath) {
      throw new Error("Source and destination cannot be the same: " + this.referencePath);
    }

    const packageFileName = await this.getPackageFileName();
    await this._project.importPackageAsync(path.join(this.artifactsPath, packageFileName));
  }

  async uninstallAsync() {
    await CoreKit.FileSystem.removePatternsAsync(this.installPath);
  }

  async getPackageFileName(): Promise<string> {
    const pkg = await CoreKit.FileSystem.File.readFileAsync(path.join(this._moduleProject.projectPath, "package.json"), "utf8");
    const tag = "v" + JSON.parse(<any>pkg).version;
    return this._moduleVendor + "." + this._moduleName + "-" + tag + ".unitypackage";
  }
}