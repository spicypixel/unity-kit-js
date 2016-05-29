import * as chai from "chai";
import { UnityEditor } from "../lib/unity-editor";
import * as fs from "fs-extra";

let should = chai.should();

describe ("UnityEditor", () => {
  it ("should be installed", () => {
    let editorPath = UnityEditor.editorPath;
    fs.existsSync(editorPath).should.be.true;
  });
});