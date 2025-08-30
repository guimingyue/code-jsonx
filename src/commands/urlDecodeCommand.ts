import * as vscode from 'vscode';

export function registerUrlDecodeCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('code-jsonx.urlDecode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found!');
            return;
        }

        const document = editor.document;

        // Check if there's a selection
        const selection = editor.selection;
        const selectedText = !selection.isEmpty ? editor.document.getText(selection) : document.getText();
        const rangeToReplace = !selection.isEmpty ? selection : new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );

        try {
            // URL decode the selected text or entire document
            const decodedText = decodeURIComponent(selectedText);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(rangeToReplace, decodedText);
            });
            
            if (!selection.isEmpty) {
                vscode.window.showInformationMessage('Selected text URL decoded successfully!');
            } else {
                vscode.window.showInformationMessage('Entire document URL decoded successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to URL decode text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    context.subscriptions.push(disposable);
}