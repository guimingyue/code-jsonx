// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Custom JSON parser that tries to find the position of error
export function parseJsonWithPosition(text: string): { success: true; result: any } | { success: false; message: string; position: number } {
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
			// we'll try to find the problematic character with a more accurate approach
			let position = 0;
			
			// Try to find the actual position by parsing character by character
			// This is a more accurate approach than the previous heuristic
			for (let i = 0; i < text.length; i++) {
				try {
					// Try parsing progressively larger substrings
					JSON.parse(text.substring(0, i + 1));
				} catch (e) {
					// If parsing fails, the error is likely at or near position i
					position = i;
					break;
				}
			}
			
			// More precise error detection for common JSON syntax errors
			// Look for specific patterns like double commas (with optional whitespace in between)
			const commaPattern = /,\s*,/;
			const commaMatch = text.match(commaPattern);
			if (commaMatch && commaMatch.index !== undefined) {
				// Find which comma is the problematic one
				const firstCommaPos = commaMatch.index;
				// Find the position of the second comma
				const secondCommaPos = text.indexOf(',', firstCommaPos + 1);
				
				// Check if removing one comma would make it valid
				const test1 = text.substring(0, secondCommaPos) + text.substring(secondCommaPos + 1);
				const test2 = text.substring(0, firstCommaPos) + text.substring(firstCommaPos + 1);
				
				try {
					JSON.parse(test1);
					// If test1 works, the error is the second comma
					position = secondCommaPos;
				} catch (e1) {
					try {
						JSON.parse(test2);
						// If test2 works, the error is the first comma
						position = firstCommaPos;
					} catch (e2) {
						// Neither worked, point to the second comma as it's usually the problem
						position = secondCommaPos;
					}
				}
			}
			
			// If we still haven't found a position, try to find the first non-whitespace character
			// after the last successfully parsed character
			if (position === 0) {
				for (let i = 0; i < text.length; i++) {
					const char = text[i];
					if (!/\s/.test(char)) { // Not whitespace
						position = i;
						break;
					}
				}
			}
			
			return { success: false, message: error.message, position };
		}
		return { success: false, message: 'Unknown error occurred', position: 0 };
	}
}

// Helper function to format JSON text
function formatJsonText(text: string, selectionText: string, selectionStartOffset: number): { success: true; result: string } | { success: false; message: string; position: number } {
	const parseResult = parseJsonWithPosition(text);
	if (!parseResult.success) {
		// Adjust position if we're working with a selection
		let adjustedPosition = parseResult.position;
		if (selectionText !== text) {
			// Check if error is within the selection
			if (parseResult.position >= selectionStartOffset && parseResult.position < selectionStartOffset + selectionText.length) {
				adjustedPosition = parseResult.position - selectionStartOffset;
			} else {
				// Error is outside selection, point to beginning of selection
				adjustedPosition = 0;
			}
		}
		return { success: false, message: parseResult.message, position: adjustedPosition };
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
function compactJsonText(text: string, selectionText: string, selectionStartOffset: number): { success: true; result: string } | { success: false; message: string; position: number } {
	const parseResult = parseJsonWithPosition(text);
	if (!parseResult.success) {
		// Adjust position if we're working with a selection
		let adjustedPosition = parseResult.position;
		if (selectionText !== text) {
			// Check if error is within the selection
			if (parseResult.position >= selectionStartOffset && parseResult.position < selectionStartOffset + selectionText.length) {
				adjustedPosition = parseResult.position - selectionStartOffset;
			} else {
				// Error is outside selection, point to beginning of selection
				adjustedPosition = 0;
			}
		}
		return { success: false, message: parseResult.message, position: adjustedPosition };
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

		// Get the full document text and selection start offset
		const fullText = document.getText();
		const selectionStartOffset = !selection.isEmpty ? document.offsetAt(selection.start) : 0;

		// Format the text (selected or entire document)
		const formatResult = formatJsonText(fullText, selectedText, selectionStartOffset);
		
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
			let errorPosition;
			if (!selection.isEmpty) {
				// For selections, we need to calculate the actual document position
				const actualErrorOffset = selectionStartOffset + formatResult.position;
				errorPosition = document.positionAt(actualErrorOffset);
			} else {
				// For whole document, use the position directly
				errorPosition = document.positionAt(formatResult.position);
			}
			
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

		// Get the full document text and selection start offset
		const fullText = document.getText();
		const selectionStartOffset = !selection.isEmpty ? document.offsetAt(selection.start) : 0;

		// Compact the text (selected or entire document)
		const compactResult = compactJsonText(fullText, selectedText, selectionStartOffset);
		
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
			let errorPosition;
			if (!selection.isEmpty) {
				// For selections, we need to calculate the actual document position
				const actualErrorOffset = selectionStartOffset + compactResult.position;
				errorPosition = document.positionAt(actualErrorOffset);
			} else {
				// For whole document, use the position directly
				errorPosition = document.positionAt(compactResult.position);
			}
			
			// Move cursor to the error position
			editor.selection = new vscode.Selection(errorPosition, errorPosition);
			editor.revealRange(new vscode.Range(errorPosition, errorPosition), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
		}
	});

	context.subscriptions.push(formatJsonDisposable, compactJsonDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}