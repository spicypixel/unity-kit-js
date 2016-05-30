import { Platform } from "@spicypixel-private/core-kit-js/lib/platform";

export class UnityEditor {
  constructor() {
    throw new Error("This class is static and not meant to be constructed");
  }

  static get editorPath(): string {
    let info = Platform.info;

    if (info.isMac)
      return "/Applications/Unity/Unity.app/Contents/MacOS/Unity";

    if (info.isWin && info.is64Bit)
      return "C:\\Program Files\\Unity\\Editor\\Unity.exe";

    if (info.isWin && !info.is64Bit)
      return "C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe";

    throw new Error("Unsupported OS");
  }

  static get enginePath(): string {
    let info = Platform.info;

    if (info.isMac)
      return "/Applications/Unity/Unity.app/Contents/Frameworks/Managed/UnityEngine.dll";

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