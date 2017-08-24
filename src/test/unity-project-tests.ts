import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as path from "path";
import { FileSystem } from "@spicypixel/core-kit-js";
import UnityProject from "../lib/unity-project";
// import UnityModuleLibraryReference from "../lib/unity-library-reference";

let should = chai.should();
chai.use(chaiAsPromised);

describe("UnityProject", () => {
  let testOutputPath = path.join(__dirname, "..", "test-output");
  let unityProject: UnityProject;

  before(async function () {
    this.timeout(30000); // requires function cb for this
    unityProject = new UnityProject(path.join(testOutputPath, "unity-test-project"));
    await FileSystem.removePatternsAsync(unityProject.projectPath);
    await unityProject.createAsync().should.be.fulfilled;
  });

  after(async function () {
    // await FileSystem.removePatternsAsync(unityProject.projectPath);
  });

  it("should have created project", function () {
    FileSystem.FileSystemRecord.accessAsync(unityProject.projectPath,
      FileSystem.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  });

  it("should create a package", async function () {
    this.timeout(30000); // requires function cb for this
    let assetsPath = path.join(unityProject.projectPath, "Assets");
    await FileSystem.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder1"));
    await FileSystem.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder2"));
    await FileSystem.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder3"));
    await FileSystem.File.writeFileAsync(path.join(assetsPath, "TestFolder1", "TestFile1.txt"), "Test1");
    await FileSystem.File.writeFileAsync(path.join(assetsPath, "TestFolder2", "TestFile2.txt"), "Test2");
    await FileSystem.File.writeFileAsync(path.join(assetsPath, "TestFolder3", "TestFile3.txt"), "Test3");

    let packagePath = path.join(testOutputPath, "unity-test-project.unitypackage");
    await unityProject.exportPackageAsync(["Assets/TestFolder1", "Assets/TestFolder2"],
      packagePath);

    await FileSystem.FileSystemRecord.accessAsync(packagePath,
      FileSystem.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  });

  // it("should clean a module", async function () {
  //   this.timeout(30000); // requires function cb for this
  //   let assetsPath = path.join(unityProject.projectPath, "Assets");
  //   let srcPath = path.join(assetsPath, "TestVendor", "Modules", "TestModule", "Source", "ModuleAssembly", "Namespace1", "Namespace2");
  //   await FileSystem.Directory.createRecursiveAsync(path.join(assetsPath, "TestVendor", "Modules", "TestModule"));
  //   await FileSystem.Directory.createRecursiveAsync(path.join(srcPath));
  //   await FileSystem.File.writeFileAsync(path.join(srcPath, "Test1.txt"), "Test1");
  //   await FileSystem.File.writeFileAsync(path.join(srcPath, "Test1.txt.meta"), "Meta1");

  //   const moduleManager = Unity.createFromProject(unityProject, "TestVendor", "TestModule");
  //   await moduleManager.cleanLibraryAsync();

  //   await FileSystem.FileSystemRecord.accessAsync(path.join(srcPath, "test1.txt"),
  //     FileSystem.FileSystemPermission.Visible).should.eventually.be.rejected;

  //   await FileSystem.FileSystemRecord.accessAsync(path.join(srcPath, "test1.txt.meta"),
  //     FileSystem.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  // });
});