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

  static createFromNodeModule(nodeScope: string, nodeModuleName: string, moduleVendor: string, moduleName: string): UnityModuleManager {
    const dependencyManager = new BuildKit.DependencyManager();
    const nodeDir = dependencyManager.getNodeModuleDir (nodeScope, nodeModuleName);
    const project = new UnityProject(nodeDir);
    return new UnityModuleManager(project, moduleVendor, moduleName);
  }

  get modulePath(): string {
    return path.join(this._unityProject.assetsPath, this._moduleVendor, "Modules", this._moduleName);
  }

  /** Update module with latest library */
  async importLibraryAsync(nodeScope: string, nodeModuleName: string,
    assemblyNames: string[], editorAssemblyNames?: string[]) {
    await this.cleanLibraryAsync();
    await this.copyLibraryToAssetsAsync(nodeScope, nodeModuleName,
      assemblyNames, editorAssemblyNames);
  }

  /** Import module */
  async importAsync() {
    const srcDir = path.resolve(this.modulePath);
    const destDir = path.resolve(path.relative(this._unityProject.projectPath, this.modulePath));

    if (destDir === srcDir) {
      throw new Error("Source and destination cannot be the same: " + srcDir);
    }

    await CoreKit.FileSystem.removePatternsAsync(
      [path.join(destDir, "**", "*"),
      "!" + path.join(destDir, "Bin"),
      "!" + path.join(destDir, "Bin", "Editor"),
      "!" + path.join("**", "*.meta")]);
    await CoreKit.FileSystem.copyPatternsAsync(
      [path.join(srcDir, "**", "*"), "!" + path.join("**", "*.meta")],
      destDir,
      { base: srcDir }
    );
  }

  /** Package */
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
    await this.cleanArtifactsAsync();
    const tag = await BuildKit.GitRevision.tagAsync();
    // await this._unityProject.packageAsync(["Assets"],
    //   "./Artifacts/" + this._moduleVendor + "." + this._moduleName + "-" + tag + ".unitypackage");
    await this._unityProject.packageAsync([path.relative(this._unityProject.projectPath, this.modulePath)],
      "./Artifacts/" + this._moduleVendor + "." + this._moduleName + "-" + tag + ".unitypackage");
  }

  async cleanArtifactsAsync() {
    await CoreKit.FileSystem.removePatternsAsync(path.join("Artifacts", "*"));
  }

  async cleanLibraryAsync() {
    await CoreKit.FileSystem.removePatternsAsync([
      "Bin/*.dll",
      "Bin/Editor/*.dll",
      "Docs/*",
      "MonoDoc/*",
      "README.md",
      "LICENSE.md",
      "!**/*.meta"
    ], { cwd: this.modulePath });
  }

  private async copyLibraryToAssetsAsync(nodeScope: string, nodeModuleName: string,
    assemblyNames: string[], editorAssemblyNames?: string[]) {
    const dependencyManager = new BuildKit.DependencyManager();
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