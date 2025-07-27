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
export function formatJsonText(text: string, selectionText: string, selectionStartOffset: number): { success: true; result: string } | { success: false; message: string; position: number } {
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
export function compactJsonText(text: string, selectionText: string, selectionStartOffset: number): { success: true; result: string } | { success: false; message: string; position: number } {
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