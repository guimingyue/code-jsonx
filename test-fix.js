"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonParser_1 = require("./out/utils/jsonParser");
// Test case: formatting a selection
const fullText = `{
  "test": "data",
  "compact": {"name":"John","age":30,"city":"New York"},
  "more": "data"
}`;
const selectedText = '{"name":"John","age":30,"city":"New York"}';
const selectionStartOffset = fullText.indexOf(selectedText);
console.log('Full text:');
console.log(fullText);
console.log('\nSelected text:');
console.log(selectedText);
console.log('\nSelection start offset:', selectionStartOffset);
console.log('\n--- Testing formatJsonText ---');
const formatResult = (0, jsonParser_1.formatJsonText)(selectedText, selectedText, selectionStartOffset);
if (formatResult.success) {
    console.log('Formatted result:');
    console.log(formatResult.result);
}
else {
    console.log('Format failed:', formatResult.message, 'at position', formatResult.position);
}
console.log('\n--- Testing compactJsonText ---');
const compactResult = (0, jsonParser_1.compactJsonText)(selectedText, selectedText, selectionStartOffset);
if (compactResult.success) {
    console.log('Compacted result:');
    console.log(compactResult.result);
}
else {
    console.log('Compact failed:', compactResult.message, 'at position', compactResult.position);
}
// Test with invalid JSON to make sure error position is correct
console.log('\n--- Testing error position with selection ---');
const invalidSelectedText = '{"name":"John","age":}';
const invalidFormatResult = (0, jsonParser_1.formatJsonText)(invalidSelectedText, invalidSelectedText, selectionStartOffset);
if (!invalidFormatResult.success) {
    console.log('Error in invalid JSON:', invalidFormatResult.message, 'at position', invalidFormatResult.position);
}
//# sourceMappingURL=test-fix.js.map