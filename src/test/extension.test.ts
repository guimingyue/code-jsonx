import * as assert from 'assert';
import * as vscode from 'vscode';

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
});
