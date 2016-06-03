import * as chai from "chai";
import { UnityEditor } from "../lib/unity-editor";
import * as fs from "@spicypixel-private/core-kit-js/lib/file-system";

let should = chai.should();

describe ("UnityEditor", () => {
  it ("should be installed", () => {
    fs.FileSystemRecord.accessAsync(UnityEditor.editorPath, fs.FileSystemPermission.Visible).should.eventually.be.fulfilled;
    fs.FileSystemRecord.accessAsync(UnityEditor.enginePath, fs.FileSystemPermission.Visible).should.eventually.be.fulfilled;
  });
});