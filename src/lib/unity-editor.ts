import { OperatingSystemProvider, Platform, Architecture } from "@spicypixel-private/core-kit-js/lib/operating-system";

export class UnityEditor {
  constructor() {
    throw new Error("This class is static and not meant to be constructed");
  }

  static get editorPath(): string {
    let platform = OperatingSystemProvider.default.platform;
    let arch = OperatingSystemProvider.default.architecture;

    if (platform === Platform.Darwin)
      return "/Applications/Unity/Unity.app/Contents/MacOS/Unity";

    if (platform === Platform.Win32 && arch === Architecture.X64)
      return "C:\\Program Files\\Unity\\Editor\\Unity.exe";

    if (platform === Platform.Win32 && arch !== Architecture.X64)
      return "C:\\Program Files (x86)\\Unity\\Editor\\Unity.exe";

    throw new Error("Unsupported OS");
  }

  static get enginePath(): string {
    let platform = OperatingSystemProvider.default.platform;
    let arch = OperatingSystemProvider.default.architecture;

    if (platform === Platform.Darwin)
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