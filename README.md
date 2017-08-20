# Spicy Pixel Unity Kit JS

This kit wraps access to the Unity Editor in a JavaScript library so it can be integrated in build scripts for continuous integration.

## Unity Editor

```javascript
export default class UnityEditor {
    constructor();
    static editorPath: string;
    static enginePath: string;
    static batchModeArgs: string[];
}
```

## Unity Project

```javascript
export default class UnityProject {
    constructor(projectPath: string);
    projectPath: string;
    assetsPath: string;
    createAsync();
    packageAsync(sourcePaths: string[], outputPath: string);
}
```

## Unity Module Manager

```javascript
export default class UnityModuleManager {
  constructor(unityProject: UnityProject, moduleVendor: string, moduleName: string);
  get modulePath(): string;
  async updateAsync(nodeScope: string, nodeModuleName: string,
    assemblyNames: string[], editorAssemblyNames?: string[]);
  async installAsync();
  async packageAsync();
}
```