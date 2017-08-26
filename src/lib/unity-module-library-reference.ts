import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";

import * as BuildKit from "@spicypixel/build-kit-js";
import * as CoreKit from "@spicypixel/core-kit-js";
import UnityProject from "./unity-project";
import UnityModule from "./unity-module";

export default class UnityModuleLibraryReference {
  private _module: UnityModule;
  private _nodeModule: BuildKit.NodeModule;

  constructor(module: UnityModule, nodeModule: BuildKit.NodeModule) {
    this._module = module;
    this._nodeModule = nodeModule;
  }

  get installPath(): string {
    return this._module.modulePath;
  }

  /** Update module with latest library */
  async installAsync(
    assemblyNames: string[], editorAssemblyNames?: string[],
    sourceNames?: string[], editorSourceNames?: string[]) {
    await this.uninstallAsync();
    await this.copyLibraryToAssetsAsync(
      assemblyNames, editorAssemblyNames, sourceNames, editorSourceNames);
  }

  async uninstallAsync() {
    // Remove files except *.meta
    await CoreKit.FileSystem.removePatternsAsync([
      "Docs/**/*",
      "Editor/**/*",
      "Lib/**/*",
      "MonoDoc/**/*",
      "Scripts/**/*",
      "README.md",
      "LICENSE.md",
      "!**/*.meta"
    ], { cwd: this.installPath, nodir: true });

    // Remove folders that no longer exist
    await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
      path.join(this._nodeModule.packageDir, "Docs"),
      path.join(this.installPath, "Docs"),
      { ignoreMissingSource: true, ignoreMissingDestination: true }
    );

    await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
      path.join(this._nodeModule.packageDir, "Source"),
      path.join(this.installPath, "Scripts"),
      { ignoreMissingSource: true, ignoreMissingDestination: true }
    );

    await CoreKit.FileSystem.Directory.removeUnmatchedAsync(
      path.join(this._nodeModule.packageDir, "Source"),
      path.join(this.installPath, "Editor"),
      { ignoreMissingSource: true, ignoreMissingDestination: true }
    );
  }

  private async copyLibraryToAssetsAsync(
    assemblyNames: string[], editorAssemblyNames: string[],
    sourceNames: string[], editorSourceNames: string[]) {

    const docsSrcDir = path.join(this._nodeModule.packageDir, "Docs");
    const sourceSrcDir = path.join(this._nodeModule.packageDir, "Source");
    const docsDestDir = path.join(this.installPath, "Docs");
    const monoDocDestDir = path.join(this.installPath, "MonoDoc");
    const libDestDir = path.join(this.installPath, "Lib");
    const editorDestDir = path.join(this.installPath, "Editor");
    const sourceDestDir = path.join(this.installPath, "Scripts");

    let promises: Promise<void>[] = [];

    assemblyNames.forEach(assembly => {
      const srcDir = path.join(sourceSrcDir, assembly, "bin", "Release");
      promises = promises.concat(
        CoreKit.FileSystem.copyPatternsAsync(
          path.join(srcDir, assembly + ".dll"),
          libDestDir,
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

    editorSourceNames.forEach(assembly => {
      const srcDir = path.join(sourceSrcDir, assembly);
      promises = promises.concat(
        CoreKit.FileSystem.copyPatternsAsync(
          [path.join(srcDir, "**", "*.cs"), "!**/AssemblyInfo.cs"],
          editorDestDir,
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
        { cwd: path.join(this._nodeModule.packageDir, "MonoDoc"), flatten: true }
      ));

    promises = promises.concat(
      CoreKit.FileSystem.copyPatternsAsync(
        ["README.md", "LICENSE.md"],
        this.installPath,
        { cwd: this._nodeModule.packageDir }
      ));

    await Promise.all(promises);
  }
}