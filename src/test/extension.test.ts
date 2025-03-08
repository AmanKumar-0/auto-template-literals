import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate, convertToTemplateLiterals, findStringLiteral, removeDuplicateConversions } from '../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('findStringLiteral detects single-quoted string', () => {
    const result = findStringLiteral("const str = 'hello';", 13);
    assert.deepStrictEqual(result, { startPos: 12, endPos: 18, quoteType: "'" });
  });

  test('findStringLiteral detects double-quoted string', () => {
    const result = findStringLiteral('const str = "hello";', 13);
    assert.deepStrictEqual(result, { startPos: 12, endPos: 18, quoteType: '"' });
  });

//   test('findStringLiteral ignores escaped quotes', () => {
//     const result = findStringLiteral("const str = 'he\'llo';", 13);
//     assert.deepStrictEqual(result, { startPos: 12, endPos: 20, quoteType: "'" });
//   });

  test('findStringLiteral returns null for non-string positions', () => {
    const result = findStringLiteral('const str = 42;', 13);
    assert.strictEqual(result, null);
  });

  test('removeDuplicateConversions filters duplicates', () => {
    const conversions = [
      { line: 1, startPos: 5, endPos: 10, quoteType: '"' },
      { line: 1, startPos: 5, endPos: 10, quoteType: '"' },
      { line: 2, startPos: 15, endPos: 20, quoteType: "'" },
    ];
    const result = removeDuplicateConversions(conversions);
    assert.strictEqual(result.length, 2);
  });

//   test('convertToTemplateLiterals replaces quotes with backticks', async () => {
//     const document = await vscode.workspace.openTextDocument({ content: "const str = 'hello';" });
//     const editor = await vscode.window.showTextDocument(document);
    
//     convertToTemplateLiterals(editor);
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for edit to complete
//     const updatedText = editor.document.getText();
//     assert.strictEqual(updatedText, "const str = `hello`;", 'String should be converted to template literal');
//   });

  test('activate should register onDidChangeTextDocument event', () => {
    const context: vscode.ExtensionContext = { subscriptions: [] } as any;
    activate(context);
    
    assert.ok(context.subscriptions.length > 0, 'Subscriptions should be registered');
  });
});
