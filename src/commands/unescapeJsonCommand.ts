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
            let textToUnescape = selectedText;
            
            // If the text is a JSON string (quoted), we need to parse it properly
            if (textToUnescape.startsWith('"') && textToUnescape.endsWith('"')) {
                // Use JSON.parse to properly handle all escape sequences including control characters
                const unescapedText = JSON.parse(textToUnescape);
                await editor.edit(editBuilder => {
                    editBuilder.replace(rangeToReplace, unescapedText);
                });
            } else {
                // If it's not quoted, we assume it's already unescaped or we try to unescape specific sequences
                // Handle common escape sequences manually
                let unescapedText = textToUnescape
                    .replace(/\\n/g, '\n')        // New line
                    .replace(/\\r/g, '\r')        // Carriage return
                    .replace(/\\t/g, '\t')        // Tab
                    .replace(/\\b/g, '\b')        // Backspace
                    .replace(/\\f/g, '\f')        // Form feed
                    .replace(/\\"/g, '"')         // Double quote
                    .replace(/\\\\/g, '\\')       // Backslash
                    .replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {  // Unicode sequences
                        try {
                            return String.fromCharCode(parseInt(hex, 16));
                        } catch (e) {
                            return match; // Return original if parsing fails
                        }
                    });
                
                await editor.edit(editBuilder => {
                    editBuilder.replace(rangeToReplace, unescapedText);
                });
            }
            
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