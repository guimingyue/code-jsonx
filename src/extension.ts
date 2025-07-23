// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "code-jsonx" is now active!');

	// Register the format JSON command
	const formatJsonDisposable = vscode.commands.registerCommand('code-jsonx.formatJson', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found!');
			return;
		}

		const document = editor.document;
		if (document.languageId !== 'json' && document.languageId !== 'jsonc') {
			vscode.window.showWarningMessage('Current file is not a JSON file!');
			return;
		}

		try {
			const text = document.getText();
			const formattedJson = JSON.stringify(JSON.parse(text), null, 2);
			
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length)
			);
			
			await editor.edit(editBuilder => {
				editBuilder.replace(fullRange, formattedJson);
			});
			
			vscode.window.showInformationMessage('JSON formatted successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to format JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

	// Register the compact JSON command
	const compactJsonDisposable = vscode.commands.registerCommand('code-jsonx.compactJson', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found!');
			return;
		}

		const document = editor.document;
		if (document.languageId !== 'json' && document.languageId !== 'jsonc') {
			vscode.window.showWarningMessage('Current file is not a JSON file!');
			return;
		}

		try {
			const text = document.getText();
			const compactedJson = JSON.stringify(JSON.parse(text));
			
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length)
			);
			
			await editor.edit(editBuilder => {
				editBuilder.replace(fullRange, compactedJson);
			});
			
			vscode.window.showInformationMessage('JSON compacted successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to compact JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

	context.subscriptions.push(formatJsonDisposable, compactJsonDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
