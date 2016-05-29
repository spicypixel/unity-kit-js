import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { UnityProject } from "../lib/unity-project";
import * as path from "path";
import * as fs from "fs-extra";

let should = chai.should();
chai.use(chaiAsPromised);

describe("UnityProject", () => {
  let testOutputPath = path.join(__dirname, "..", "test-output");
  let unityProject: UnityProject;

  before(function () {
    this.timeout(15000); // requires function cb for this
    unityProject = new UnityProject(path.join(testOutputPath, "unity-test-project"));
    fs.removeSync(unityProject.projectPath);
    return unityProject.createAsync().should.be.fulfilled;
  });

  after(() => {
    // fs.removeSync(unityProject.projectPath);
  });

  it("should have created project", function () {
    fs.existsSync(unityProject.projectPath).should.be.true;
  });

  it("should create a package", function () {
    this.timeout(15000); // requires function cb for this
    let assetsPath = path.join(unityProject.projectPath, "Assets");
    fs.mkdirpSync(path.join(assetsPath, "TestFolder1"));
    fs.mkdirpSync(path.join(assetsPath, "TestFolder2"));
    fs.mkdirpSync(path.join(assetsPath, "TestFolder3"));
    fs.writeFileSync(path.join(assetsPath, "TestFolder1", "TestFile1.txt"), "Test1");
    fs.writeFileSync(path.join(assetsPath, "TestFolder2", "TestFile2.txt"), "Test2");
    fs.writeFileSync(path.join(assetsPath, "TestFolder3", "TestFile3.txt"), "Test3");

    let packagePath = path.join(testOutputPath, "unity-test-project.unitypackage");
    return unityProject.packageAsync(["Assets/TestFolder1", "Assets/TestFolder2"],
      packagePath)
      .then(() => fs.existsSync(packagePath).should.be.true);
  });
});