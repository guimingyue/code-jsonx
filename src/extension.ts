// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerFormatJsonCommand } from './commands/formatJsonCommand';
import { registerCompactJsonCommand } from './commands/compactJsonCommand';
import { registerEscapeJsonCommand } from './commands/escapeJsonCommand';
import { registerUnescapeJsonCommand } from './commands/unescapeJsonCommand';
import { registerUrlEncodeCommand } from './commands/urlEncodeCommand';
import { registerUrlDecodeCommand } from './commands/urlDecodeCommand';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-jsonx" is now active!');

	// Register the format JSON command
	registerFormatJsonCommand(context);

	// Register the compact JSON command
	registerCompactJsonCommand(context);

	// Register the escape JSON command
	registerEscapeJsonCommand(context);

	// Register the unescape JSON command
	registerUnescapeJsonCommand(context);

	// Register the URL encode command
	registerUrlEncodeCommand(context);

	// Register the URL decode command
	registerUrlDecodeCommand(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}