import * as vscode from 'vscode';
import { formatJsonText } from '../utils/jsonParser';

export function registerFormatJsonCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('code-jsonx.formatJson', async () => {
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
        const formatResult = formatJsonText(selectedText, selectedText, selectionStartOffset);
        
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

    context.subscriptions.push(disposable);
}