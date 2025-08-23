
# CodeJsonX

This is a VS Code extension that provides JSON formatting, compression, and text escaping capabilities for developers working with JSON files. This project is developed purely using Qwen Code and Lingma Code Assistant. The development process is in the series of articles published on [My Blog](https://guimy.tech).

## Features

This extension provides four main features for working with JSON files:

1. **Format JSON**: Pretty-prints your JSON with proper indentation and spacing.
2. **Compact JSON**: Removes all unnecessary whitespace from your JSON to make it compact.
3. **Escape JSON Text**: Escapes special characters in JSON text for use in strings.
4. **Unescape JSON Text**: Unescapes JSON text to convert it back to its original form.

All commands can be accessed through:
- The Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
- The context menu when right-clicking in a JSON file (under the "CodeJsonX" submenu)
- The editor title bar menu when working with a JSON file (under the "CodeJsonX" submenu)

### Format JSON
Converts compact JSON into a well-formatted, readable format with proper indentation.

### Compact JSON
Removes all unnecessary whitespace from JSON to create a compact representation.

### Escape JSON Text
Converts regular text into properly escaped JSON text that can be safely included in JSON strings.

Example:
```json
{"a":"x","b":1,"c":true}
```
Becomes:
```json
{"a": "x", "b": 1, "c": true}
```

### Unescape JSON Text
Converts escaped JSON text back to its original form.

Example:
```json
{"a": "x\nnewline", "b": 1, "c": true}
```
Becomes:
```json
{"a": "x
newline", "b": 1, "c": true}
```

## Requirements

No special requirements. This extension works with standard VS Code installations.

## Extension Settings

This extension does not contribute any VS Code settings.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release with JSON formatting, compaction, escaping, and unescaping features.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
