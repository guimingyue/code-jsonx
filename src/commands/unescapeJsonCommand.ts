import * as vscode from 'vscode';

export function registerUnescapeJsonCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('code-jsonx.unescapeJson', async () => {
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
            // Unescape the JSON text
            // Remove surrounding quotes if present
            let textToUnescape = selectedText;
            if (textToUnescape.startsWith('"') && textToUnescape.endsWith('"')) {
                textToUnescape = textToUnescape.substring(1, textToUnescape.length - 1);
            }
            
            const unescapedText = JSON.parse(`"${textToUnescape}"`);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(rangeToReplace, unescapedText);
            });
            
            if (!selection.isEmpty) {
                vscode.window.showInformationMessage('Selected text unescaped successfully!');
            } else {
                vscode.window.showInformationMessage('Text unescaped successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to unescape text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });

    context.subscriptions.push(disposable);
}