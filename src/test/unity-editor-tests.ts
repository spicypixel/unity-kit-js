import * as chai from "chai";
import { UnityEditor } from "../lib/unity-editor";
import * as pathExists from "path-exists";

let should = chai.should();

describe ("UnityEditor", () => {
  it ("should be installed", () => {
    let editorPath = UnityEditor.editorPath;
    pathExists.sync(editorPath).should.be.true;
  });
});