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

    await this.uninstallAsync();

    // Installing using the package would load Unity
    // and package import would fail because scripts that
    // depend on the package wouldn't find it yet.
    //
    // Launching Unity will also trigger a scan and
    // remove any .metas for files that are not present.
    //
    // Perform a file system copy instead.

    // const packageFileName = await this.getPackageFileName();
    // await this._module.project.importPackageAsync(path.join(this.artifactsPath, packageFileName));

    CoreKit.FileSystem.copyPatternsAsync(path.join(this.referencePath, "**", "*"), this.installPath);
    CoreKit.FileSystem.File.copyAsync(this.referencePath + ".meta", this.installPath + ".meta");
  }

  async uninstallAsync() {
    await CoreKit.FileSystem.removePatternsAsync(path.join(this.installPath, "*"));

    // Remove files except *.meta
    // await CoreKit.FileSystem.removePatternsAsync([
    //   "**/*",
    //   "!**/*.meta"
    // ], { cwd: this.installPath, nodir: true });

    // Remove folders that no longer exist
    // await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
    //   this.referencePath,
    //   this.installPath,
    //   { ignoreMissingSource: true, ignoreMissingDestination: true }
    // );
  }

  async getPackageFileName(): Promise<string> {
    const pkg = await CoreKit.FileSystem.File.readFileAsync(path.join(this._nodeModuleProject.projectPath, "package.json"), "utf8");
    const tag = "v" + JSON.parse(<any>pkg).version;
    return this._nodeModuleVendor + "." + this._nodeModuleName + "-" + tag + ".unitypackage";
  }
}