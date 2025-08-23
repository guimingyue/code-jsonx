import * as vscode from 'vscode';

export function registerEscapeJsonCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('code-jsonx.escapeJson', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found!');
            return;
        }

        // Check if there's a selection
        const selection = editor.selection;
        const selectedText = !selection.isEmpty ? editor.document.getText(selection) : editor.document.getText();
        const rangeToReplace = !selection.isEmpty ? selection : new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(editor.document.getText().length)
        );

        try {
            // Escape the JSON text
            const escapedText = JSON.stringify(selectedText);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(rangeToReplace, escapedText);
            });
            
            if (!selection.isEmpty) {
                vscode.window.showInformationMessage('Selected text escaped successfully!');
            } else {
                vscode.window.showInformationMessage('Text escaped successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to escape text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    context.subscriptions.push(disposable);
}