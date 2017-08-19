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

  constructor(unityProject: UnityProject, moduleVendor: string, moduleName: string) {
    this._unityProject = unityProject;
    this._moduleVendor = moduleVendor;
    this._moduleName = moduleName;
  }

  get modulePath(): string {
    return path.join(this._unityProject.assetsPath, this._moduleVendor, "Modules", this._moduleName);
  }

  async refreshDependenciesAsync(nodeScope: string, nodeModuleName: string,
    assemblyNames: string[], editorAssemblyNames?: string[]) {
    await this.cleanDependenciesAsync();
    await this.copyDependenciesToAssetsAsync(nodeScope, nodeModuleName,
      assemblyNames, editorAssemblyNames);
  }

  async packageAsync() {
    try {
      await CoreKit.FileSystem.Directory.accessAsync(this.modulePath,
        CoreKit.FileSystem.FileSystemPermission.Visible);
    }
    catch (err) {
      gutil.log("Skipping build Unity package because module folder does not exist: ", this.modulePath);
      return;
    }

    await CoreKit.FileSystem.Directory.createRecursiveAsync("Artifacts");
    const tag = await BuildKit.GitRevision.tagAsync();
    await this._unityProject.packageAsync([path.relative(this._unityProject.projectPath, this.modulePath)],
      "./Artifacts/" + this._moduleVendor + "." + this._moduleName + "-" + tag + ".unitypackage");
  }

  private async cleanDependenciesAsync() {
    gutil.log(gutil.colors.cyan("Cleaning ..."));

    await CoreKit.FileSystem.removePatternsAsync("Artifacts/*");
    await CoreKit.FileSystem.removePatternsAsync([
      "Bin/*.dll",
      "Bin/Editor/*.dll",
      "Docs/*",
      "MonoDoc/*",
      "README.md",
      "LICENSE.md"
    ], { globOptions: { cwd: this.modulePath, ignore: "*.meta" } });
  }

  private async copyDependenciesToAssetsAsync(nodeScope: string, nodeModuleName: string,
    assemblyNames: string[], editorAssemblyNames?: string[]) {
    let dependencyManager = new BuildKit.DependencyManager();
    const nodeModuleDir = dependencyManager.getNodeModuleDir (nodeScope, nodeModuleName);

    const docsSrcDir = path.join(nodeModuleDir, "Docs");
    const sourceSrcDir = path.join(nodeModuleDir, "Source");
    const docsDestDir = path.join(this.modulePath, "Docs");
    const monoDocDestDir = path.join(this.modulePath, "MonoDoc");
    const binDestDir = path.join(this.modulePath, "Bin");
    const editorDestDir = path.join(binDestDir, "Editor");

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
        this.modulePath,
        { cwd: nodeModuleDir }
      ));

    await Promise.all(promises);
  }
}