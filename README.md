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
    createAsync(): Promise<any>;
    packageAsync(sourcePaths: string[], outputPath: string): Promise<any>;
}
```