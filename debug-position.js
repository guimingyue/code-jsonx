// Test to verify position calculation
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

// Read the sample JSON file
const text = fs.readFileSync('./debug-invalid.json', 'utf8');
console.log('Sample JSON:');
console.log(text);

// Parse the JSON to find the error position
const parseResult = parseJsonWithPosition(text);
console.log('\nParse result:');
console.log('Success:', parseResult.success);

if (!parseResult.success) {
  console.log('Error message:', parseResult.message);
  console.log('Error position (character offset):', parseResult.position);
  
  // Convert the position to line and character
  const errorPosition = positionAt(parseResult.position, text);
  console.log('Error position (line, character):', errorPosition);
  
  // Check what character is at that position
  const char = text[parseResult.position];
  console.log('Character at error position:', char ? `"${char}"` : '(end of file)');
  
  // Test with a selection (simulate selecting part of the document)
  // Let's simulate selecting from the beginning to somewhere in the middle
  const selectionStart = { line: 0, character: 0 }; // Start from beginning
  const selectionEnd = { line: 5, character: 0 }; // End at beginning of line 5
  
  const selectionStartOffset = offsetAt(selectionStart, text);
  const selectionEndOffset = offsetAt(selectionEnd, text);
  
  console.log('\nSimulating selection from start to line 5:');
  console.log('Selection start offset:', selectionStartOffset);
  console.log('Selection end offset:', selectionEndOffset);
  
  // Extract selected text
  const selectedText = text.substring(selectionStartOffset, selectionEndOffset);
  console.log('Selected text:');
  console.log(selectedText);
  
  // Parse the selected text
  const selectedParseResult = parseJsonWithPosition(selectedText);
  console.log('\nParse result for selected text:');
  console.log('Success:', selectedParseResult.success);
  
  if (!selectedParseResult.success) {
    console.log('Error position in selection:', selectedParseResult.position);
    
    // Calculate the actual position in the document
    const actualErrorPositionOffset = selectionStartOffset + selectedParseResult.position;
    console.log('Actual error position offset in document:', actualErrorPositionOffset);
    
    const actualErrorPosition = positionAt(actualErrorPositionOffset, text);
    console.log('Actual error position (line, character):', actualErrorPosition);
    
    // Compare with what our extension code would calculate
    console.log('\nExtension code simulation:');
    console.log('Selection isEmpty: false');
    console.log('Document length:', text.length);
    console.log('Compact result position:', selectedParseResult.position);
    console.log('Selection start offset:', selectionStartOffset);
    console.log('Calculated error offset:', selectionStartOffset + selectedParseResult.position);
    console.log('Error position line/char:', actualErrorPosition.line, actualErrorPosition.character);
  }
}