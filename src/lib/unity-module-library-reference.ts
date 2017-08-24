import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityProject from "./unity-project";

export default class UnityModuleLibraryReference {
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

  static createFromNodeModule(project: UnityProject, nodeScope: string, nodeModuleName: string, moduleVendor: string, moduleName: string): UnityModuleLibraryReference {
    const dependencyManager = new BuildKit.DependencyManager();
    const nodeDir = dependencyManager.getNodeModuleDir (nodeScope, nodeModuleName);
    const moduleProject = new UnityProject(nodeDir);
    return new UnityModuleLibraryReference(project, moduleProject, moduleVendor, moduleName);
  }

  get referencePath(): string {
    return path.resolve(path.join(this._moduleProject.assetsPath, this._moduleVendor, "Modules", this._moduleName));
  }

  get installPath(): string {
    return path.resolve(path.join(this._project.assetsPath, this._moduleVendor, "Modules", this._moduleName));
  }

  /** Update module with latest library */
  async installAsync(
    assemblyNames: string[], editorAssemblyNames: string[], sourceNames: string[]) {
    await this.uninstallAsync();
    await this.copyLibraryToAssetsAsync(
      assemblyNames, editorAssemblyNames, sourceNames);
  }

  async uninstallAsync() {
    // Remove files except *.meta
    await CoreKit.FileSystem.removePatternsAsync([
      "Bin/*",
      "Bin/Editor/*",
      "Docs/*",
      "MonoDoc/*",
      "Source/**/*",
      "README.md",
      "LICENSE.md",
      "!**/*.meta"
    ], { cwd: this.installPath, nodir: true });

    // Remove folders that no longer exist
    let found: boolean;
    try {
      await CoreKit.FileSystem.Directory.accessAsync(path.join(this.referencePath, "Docs"),
        CoreKit.FileSystem.FileSystemPermission.Visible);
      await CoreKit.FileSystem.Directory.accessAsync(path.join(this.installPath, "Docs"),
        CoreKit.FileSystem.FileSystemPermission.Visible);
      found = true;
    }
    catch (error) {
      found = false;
    }
    if (found) {
      await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
        path.join(this.referencePath, "Docs"),
        path.join(this.installPath, "Docs")
      );
    }
    try {
      await CoreKit.FileSystem.Directory.accessAsync(path.join(this.referencePath, "Source"),
        CoreKit.FileSystem.FileSystemPermission.Visible);
      await CoreKit.FileSystem.Directory.accessAsync(path.join(this.installPath, "Source"),
        CoreKit.FileSystem.FileSystemPermission.Visible);
      found = true;
    }
    catch (error) {
      found = false;
    }
    if (found) {
      await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
        path.join(this.referencePath, "Source"),
        path.join(this.installPath, "Source")
      );
    }
  }

  private async copyLibraryToAssetsAsync(
    assemblyNames: string[], editorAssemblyNames: string[], sourceNames: string[]) {
    const dependencyManager = new BuildKit.DependencyManager();
    const nodeModuleDir = this._moduleProject.projectPath;

    const docsSrcDir = path.join(nodeModuleDir, "Docs");
    const sourceSrcDir = path.join(nodeModuleDir, "Source");
    const docsDestDir = path.join(this.installPath, "Docs");
    const monoDocDestDir = path.join(this.installPath, "MonoDoc");
    const binDestDir = path.join(this.installPath, "Bin");
    const editorDestDir = path.join(binDestDir, "Editor");
    const sourceDestDir = path.join(this.installPath, "Source");

    let promises: Promise<void>[] = [];

    assemblyNames.forEach(assembly => {
      const srcDir = path.join(sourceSrcDir, assembly, "bin", "Release");
      promises = promises.concat(
        CoreKit.FileSystem.copyPatternsAsync(
          path.join(srcDir, assembly + ".dll"),
          binDestDir,
          { base: srcDir }
        ));
    });

    editorAssemblyNames.forEach(assembly => {
      const srcDir = path.join(sourceSrcDir, assembly, "bin", "Release");
      promises = promises.concat(
        CoreKit.FileSystem.copyPatternsAsync(
          path.join(srcDir, assembly + ".dll"),
          editorDestDir,
          { base: srcDir }
        ));
    });

    sourceNames.forEach(assembly => {
      const srcDir = path.join(sourceSrcDir, assembly);
      promises = promises.concat(
        CoreKit.FileSystem.copyPatternsAsync(
          [path.join(srcDir, "**", "*.cs"), "!**/AssemblyInfo.cs"],
          sourceDestDir,
          { base: sourceSrcDir }
        ));
    });

    promises = promises.concat(
      CoreKit.FileSystem.copyPatternsAsync(
        path.join(docsSrcDir, "**/*"),
        docsDestDir,
        { base: docsSrcDir }
      ));

    promises = promises.concat(
      CoreKit.FileSystem.copyPatternsAsync(
        [
          "*.source",
          "assemble/*.tree",
          "assemble/*.zip",
        ],
        monoDocDestDir,
        { cwd: path.join(nodeModuleDir, "MonoDoc"), flatten: true }
      ));

    promises = promises.concat(
      CoreKit.FileSystem.copyPatternsAsync(
        ["README.md", "LICENSE.md"],
        this.installPath,
        { cwd: nodeModuleDir }
      ));

    await Promise.all(promises);
  }
}