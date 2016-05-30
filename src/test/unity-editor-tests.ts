import * as chai from "chai";
import { UnityEditor } from "../lib/unity-editor";
import * as fs from "fs-extra";

let should = chai.should();

describe ("UnityEditor", () => {
  it ("should be installed", () => {
    fs.existsSync(UnityEditor.editorPath).should.be.true;
    fs.existsSync(UnityEditor.enginePath).should.be.true;
  });
});