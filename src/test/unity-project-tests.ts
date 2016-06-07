import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as path from "path";
import * as fsn from "fs";
import * as fs from "@spicypixel/core-kit-js/lib/file-system";
import UnityProject from "../lib/unity-project";

let should = chai.should();
chai.use(chaiAsPromised);

describe("UnityProject", () => {
  let testOutputPath = path.join(__dirname, "..", "test-output");
  let unityProject: UnityProject;

  before(async function () {
    this.timeout(30000); // requires function cb for this
    unityProject = new UnityProject(path.join(testOutputPath, "unity-test-project"));
    await fs.removePatternsAsync(unityProject.projectPath);
    return unityProject.createAsync().should.be.fulfilled;
  });

  after(() => {
    // await fs.removePatternsAsync(unityProject.projectPath);
  });

  it("should have created project", function () {
    fs.FileSystemRecord.accessAsync(unityProject.projectPath,
      fs.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  });

  it("should create a package", async function () {
    this.timeout(30000); // requires function cb for this
    let assetsPath = path.join(unityProject.projectPath, "Assets");
    await fs.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder1"));
    await fs.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder2"));
    await fs.Directory.createRecursiveAsync(path.join(assetsPath, "TestFolder3"));
    fsn.writeFileSync(path.join(assetsPath, "TestFolder1", "TestFile1.txt"), "Test1");
    fsn.writeFileSync(path.join(assetsPath, "TestFolder2", "TestFile2.txt"), "Test2");
    fsn.writeFileSync(path.join(assetsPath, "TestFolder3", "TestFile3.txt"), "Test3");

    let packagePath = path.join(testOutputPath, "unity-test-project.unitypackage");
    await unityProject.packageAsync(["Assets/TestFolder1", "Assets/TestFolder2"],
      packagePath);

    await fs.FileSystemRecord.accessAsync(packagePath,
      fs.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  });
});