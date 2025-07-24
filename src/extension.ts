// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Custom JSON parser that tries to find the position of error
function parseJsonWithPosition(text: string): { success: true; result: any } | { success: false; message: string; position: number } {
	try {
		const result = JSON.parse(text);
		return { success: true, result };
	} catch (error) {
		if (error instanceof Error) {
			// Try to extract position information from error message
			const positionMatch = error.message.match(/position (\d+)/);
			if (positionMatch) {
				const position = parseInt(positionMatch[1], 10);
				return { success: false, message: error.message, position };
			}
			
			// For newer Node.js versions that don't include position in error message,
			// we'll try to find the problematic character manually
			// This is a simplified approach - in a real implementation you might want
			// more sophisticated parsing
			const commonErrorPatterns = [
				/Unexpected token (.*) in JSON/,
				/Unexpected end of JSON/,
				/Expected ':' after property name/,
				/Expected property name or '\}'/
			];
			
			for (const pattern of commonErrorPatterns) {
				if (pattern.test(error.message)) {
					// Try to find the approximate position by scanning for common problematic characters
					const problematicChars = [',', '}', '{', '[', ']', ':', '"'];
					for (let i = 0; i < text.length; i++) {
						if (problematicChars.includes(text[i])) {
							// Simple heuristic - not perfect but better than position 0
							return { success: false, message: error.message, position: i };
						}
					}
					break;
				}
			}
			
			// Default to position 0 if we can't determine a better position
			return { success: false, message: error.message, position: 0 };
		}
		return { success: false, message: 'Unknown error occurred', position: 0 };
	}
}

// Helper function to format JSON text
function formatJsonText(text: string): { success: true; result: string } | { success: false; message: string; position: number } {
	const parseResult = parseJsonWithPosition(text);
	if (!parseResult.success) {
		return parseResult;
	}
	
	try {
		const result = JSON.stringify(parseResult.result, null, 2);
		return { success: true, result };
	} catch (error) {
		return { 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to format JSON',
			position: 0
		};
	}
}

// Helper function to compact JSON text
function compactJsonText(text: string): { success: true; result: string } | { success: false; message: string; position: number } {
	const parseResult = parseJsonWithPosition(text);
	if (!parseResult.success) {
		return parseResult;
	}
	
	try {
		const result = JSON.stringify(parseResult.result);
		return { success: true, result };
	} catch (error) {
		return { 
			success: false, 
			message: error instanceof Error ? error.message : 'Failed to compact JSON',
			position: 0
		};
	}
}

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

		// Check if there's a selection
		const selection = editor.selection;
		const selectedText = !selection.isEmpty ? editor.document.getText(selection) : document.getText();
		const rangeToReplace = !selection.isEmpty ? selection : new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		// Format the text (selected or entire document)
		const formatResult = formatJsonText(selectedText);
		
		if (formatResult.success) {
			await editor.edit(editBuilder => {
				editBuilder.replace(rangeToReplace, formatResult.result);
			});
			
			if (!selection.isEmpty) {
				vscode.window.showInformationMessage('Selected JSON formatted successfully!');
			} else {
				vscode.window.showInformationMessage('JSON formatted successfully!');
			}
		} else {
			// Show error message and position cursor at error location
			vscode.window.showErrorMessage(`Failed to format JSON: ${formatResult.message}`);
			
			// Calculate the position in the document
			const errorPosition = !selection.isEmpty 
				? document.positionAt(selection.start.character + formatResult.position)
				: document.positionAt(formatResult.position);
			
			// Move cursor to the error position
			editor.selection = new vscode.Selection(errorPosition, errorPosition);
			editor.revealRange(new vscode.Range(errorPosition, errorPosition), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
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

		// Check if there's a selection
		const selection = editor.selection;
		const selectedText = !selection.isEmpty ? editor.document.getText(selection) : document.getText();
		const rangeToReplace = !selection.isEmpty ? selection : new vscode.Range(
			document.positionAt(0),
			document.positionAt(document.getText().length)
		);

		// Compact the text (selected or entire document)
		const compactResult = compactJsonText(selectedText);
		
		if (compactResult.success) {
			await editor.edit(editBuilder => {
				editBuilder.replace(rangeToReplace, compactResult.result);
			});
			
			if (!selection.isEmpty) {
				vscode.window.showInformationMessage('Selected JSON compacted successfully!');
			} else {
				vscode.window.showInformationMessage('JSON compacted successfully!');
			}
		} else {
			// Show error message and position cursor at error location
			vscode.window.showErrorMessage(`Failed to compact JSON: ${compactResult.message}`);
			
			// Calculate the position in the document
			const errorPosition = !selection.isEmpty 
				? document.positionAt(selection.start.character + compactResult.position)
				: document.positionAt(compactResult.position);
			
			// Move cursor to the error position
			editor.selection = new vscode.Selection(errorPosition, errorPosition);
			editor.revealRange(new vscode.Range(errorPosition, errorPosition), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		}
	});

	context.subscriptions.push(formatJsonDisposable, compactJsonDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
