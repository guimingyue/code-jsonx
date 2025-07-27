// Test to verify the updated position calculation approach
const fs = require('fs');

// Custom JSON parser that tries to find the position of error
function parseJsonWithPosition(text) {
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

// Simulate VS Code position functions
function createPosition(line, character) {
  return { line, character };
}

function positionAt(offset, text) {
  let line = 0;
  let character = 0;
  
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      character = 0;
    } else {
      character++;
    }
  }
  
  return createPosition(line, character);
}

function offsetAt(position, text) {
  let offset = 0;
  let currentLine = 0;
  let currentChar = 0;
  
  for (let i = 0; i < text.length; i++) {
    if (currentLine === position.line && currentChar === position.character) {
      return offset;
    }
    
    if (text[i] === '\n') {
      currentLine++;
      currentChar = 0;
    } else {
      currentChar++;
    }
    
    offset++;
  }
  
  return offset;
}

// Updated helper functions to match the extension code
function formatJsonText(fullText, selectedText, selectionStartOffset) {
  const parseResult = parseJsonWithPosition(fullText);
  if (!parseResult.success) {
    // Adjust position if we're working with a selection
    let adjustedPosition = parseResult.position;
    if (selectedText !== fullText) {
      // Check if error is within the selection
      if (parseResult.position >= selectionStartOffset && parseResult.position < selectionStartOffset + selectedText.length) {
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

// Read the sample JSON file
const fullText = fs.readFileSync('./debug-invalid-2.json', 'utf8');
console.log('Sample JSON:');
console.log(fullText);

// Parse the JSON to find the error position
const parseResult = parseJsonWithPosition(fullText);
console.log('\nParse result for full text:');
console.log('Success:', parseResult.success);

if (!parseResult.success) {
  console.log('Error message:', parseResult.message);
  console.log('Error position (character offset):', parseResult.position);
  
  // Convert the position to line and character
  const errorPosition = positionAt(parseResult.position, fullText);
  console.log('Error position (line, character):', errorPosition);
  
  // Check what character is at that position
  const char = fullText[parseResult.position];
  console.log('Character at error position:', char ? `"${char}"` : '(end of file)');
  
  // Test with a selection (simulate selecting part of the document)
  // Let's simulate selecting from the beginning to somewhere in the middle
  const selectionStart = { line: 0, character: 0 }; // Start from beginning
  const selectionEnd = { line: 12, character: 0 }; // End at beginning of line 12
  
  const selectionStartOffset = offsetAt(selectionStart, fullText);
  const selectionEndOffset = offsetAt(selectionEnd, fullText);
  
  console.log('\nSimulating selection from start to line 12:');
  console.log('Selection start offset:', selectionStartOffset);
  console.log('Selection end offset:', selectionEndOffset);
  
  // Extract selected text
  const selectedText = fullText.substring(selectionStartOffset, selectionEndOffset);
  console.log('Selected text:');
  console.log(selectedText);
  
  // Use the updated approach - parse full text but adjust position for selection
  const formatResult = formatJsonText(fullText, selectedText, selectionStartOffset);
  console.log('\nFormat result (using updated approach):');
  console.log('Success:', formatResult.success);
  
  if (!formatResult.success) {
    console.log('Error position in selection:', formatResult.position);
    
    // Calculate the actual position in the document
    const actualErrorPositionOffset = selectionStartOffset + formatResult.position;
    console.log('Actual error position offset in document:', actualErrorPositionOffset);
    
    const actualErrorPosition = positionAt(actualErrorPositionOffset, fullText);
    console.log('Actual error position (line, character):', actualErrorPosition);
    
    // Compare with what our extension code would calculate
    console.log('\nExtension code simulation:');
    console.log('Selection isEmpty: false');
    console.log('Document length:', fullText.length);
    console.log('Format result position:', formatResult.position);
    console.log('Selection start offset:', selectionStartOffset);
    console.log('Calculated error offset:', selectionStartOffset + formatResult.position);
    console.log('Error position line/char:', actualErrorPosition.line, actualErrorPosition.character);
  }
}