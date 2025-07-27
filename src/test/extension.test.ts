import * as assert from 'assert';
import * as vscode from 'vscode';
import { parseJsonWithPosition } from '../utils/jsonParser';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('JSON formatting test', () => {
		// Create a new document with unformatted JSON
		const unformattedJson = '{"name":"John","age":30,"city":"New York"}';
		const formattedJson = '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}';
		
		// Test the formatting function directly
		const result = JSON.stringify(JSON.parse(unformattedJson), null, 2);
		assert.strictEqual(result, formattedJson);
	});

	test('JSON compaction test', () => {
		// Create a new document with formatted JSON
		const formattedJson = '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}';
		const compactedJson = '{"name":"John","age":30,"city":"New York"}';
		
		// Test the compaction function directly
		const result = JSON.stringify(JSON.parse(formattedJson));
		assert.strictEqual(result, compactedJson);
	});
	
	test('JSON error position detection test', () => {
		// Test with a missing closing brace
		const invalidJson1 = '{"name": "John", "age": 30';
		const result1 = parseJsonWithPosition(invalidJson1);
		assert.strictEqual(result1.success, false);
		// Should detect error near the end
		assert.ok(result1.position >= invalidJson1.length - 5);
		
		// Test with an unexpected character
		const invalidJson2 = '{"name": "John", "age": 30,}';
		const result2 = parseJsonWithPosition(invalidJson2);
		assert.strictEqual(result2.success, false);
		// Should detect error near the problematic comma
		assert.ok(result2.position >= invalidJson2.indexOf(',') + 1);
		
		// Test with an unexpected token
		const invalidJson3 = '{"name": "John" "age": 30}';
		const result3 = parseJsonWithPosition(invalidJson3);
		assert.strictEqual(result3.success, false);
		// Should detect error near the missing comma
		assert.ok(result3.position >= invalidJson3.indexOf('"age"') - 2);
	});
	
	test('JSON error position with selection test', () => {
		const fullText = '{"name": "John","age": 30,"city": "New York"}\n{"invalid": json}';
		const selectionText = '{"invalid": json}';
		const selectionStartOffset = fullText.indexOf('{"invalid": json}');
		
		// Test that error position is correctly adjusted for selection
		const result = parseJsonWithPosition(fullText);
		assert.strictEqual(result.success, false);
		
		// The error should be in the second JSON object
		assert.ok(result.position > selectionStartOffset);
	});
	
	test('JSON double comma error detection test', () => {
		// Test the specific case: [{"a":"b","c":1,"d":true},,{"a":"b","c":1,"d":true}]
		const invalidJson = '[{"a":"b","c":1,"d":true},,{"a":"b","c":1,"d":true}]';
		const result = parseJsonWithPosition(invalidJson);
		
		assert.strictEqual(result.success, false);
		// The error should be detected at the position of the second comma
		assert.strictEqual(result.position, 26);
		
		// Verify that the character at position 26 is indeed the second comma
		assert.strictEqual(invalidJson[result.position], ',');
		// The first comma should be at position 25
		assert.strictEqual(invalidJson[result.position - 1], ',');
	});
	
	test('JSON formatted double comma error detection test', () => {
		// Test the formatted case with spaced commas:
		// [
		//   {
		//     "a": "b",
		//     "c": 1,
		//     "d": true
		//   },
		//   ,
		//   {
		//     "a": "b",
		//     "c": 1,
		//     "d": true
		//   }
		// ]
		const invalidJson = '[\n  {\n    "a": "b",\n    "c": 1,\n    "d": true\n  },\n  ,\n  {\n    "a": "b",\n    "c": 1,\n    "d": true\n  }\n]';
		const result = parseJsonWithPosition(invalidJson);
		
		assert.strictEqual(result.success, false);
		// The error should be detected at the position of the second comma (which is the only comma in this case)
		// It should be at line 6, which is position 53 in the string
		assert.strictEqual(result.position, 53);
		
		// Verify that the character at position 53 is indeed a comma
		assert.strictEqual(invalidJson[result.position], ',');
	});
});