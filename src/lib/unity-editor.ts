export class UnityEditor {
  constructor() {
    throw new Error("This class is static and not meant to be constructed");
  }

  static get editorPath(): string {
    let isWin = /^win/.test(process.platform);
    let isMac = /^darwin/.test(process.platform);
    let is64 = (process.arch === "x64" || process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432"));

    if (isMac)
      return "/Applications/Unity/Unity.app/Contents/MacOS/Unity";

    if (isWin && is64)
      return "C:\\Program Files\\Unity\\Editor\\Unity.exe";

    if (isWin && !is64)
      return "C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe";

    throw new Error("Unsupported OS");
  }

  static get batchModeArgs(): string[] {
    return [
      "-batchmode",
      "-nographics",
      "-quit"
    ];
  }
}