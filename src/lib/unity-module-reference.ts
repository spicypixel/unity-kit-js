import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityModule from "./unity-module";
import UnityProject from "./unity-project";

export default class UnityModuleReference {
  private _module: UnityModule;
  private _nodeModule: BuildKit.NodeModule;
  private _nodeModuleVendor: string;
  private _nodeModuleName: string;
  private _nodeModuleProject: UnityProject;

  constructor(module: UnityModule, nodeModule: BuildKit.NodeModule, nodeModuleVendor: string, nodeModuleName: string) {
    this._module = module;
    this._nodeModule = nodeModule;
    this._nodeModuleVendor = nodeModuleVendor;
    this._nodeModuleName = nodeModuleName;
    this._nodeModuleProject = new UnityProject(nodeModule.packageDir);
  }

  get referencePath(): string {
    return path.resolve(path.join(this._nodeModuleProject.assetsPath, this._nodeModuleVendor, "Modules", this._nodeModuleName));
  }

  get installPath(): string {
    return path.resolve(path.join(this._module.project.assetsPath, this._nodeModuleVendor, "Modules", this._nodeModuleName));
  }

  get artifactsPath(): string {
    return path.join(this._nodeModuleProject.projectPath, "Artifacts");
  }

  async installAsync() {
    if (this.referencePath === this.installPath) {
      throw new Error("Source and destination cannot be the same: " + this.referencePath);
    }

    const packageFileName = await this.getPackageFileName();
    await this._module.project.importPackageAsync(path.join(this.artifactsPath, packageFileName));
  }

  async uninstallAsync() {
    await CoreKit.FileSystem.removePatternsAsync(this.installPath);
  }

  async getPackageFileName(): Promise<string> {
    const pkg = await CoreKit.FileSystem.File.readFileAsync(path.join(this._nodeModuleProject.projectPath, "package.json"), "utf8");
    const tag = "v" + JSON.parse(<any>pkg).version;
    return this._nodeModuleVendor + "." + this._nodeModuleName + "-" + tag + ".unitypackage";
  }
}