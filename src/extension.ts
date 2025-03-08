import * as vscode from 'vscode';

/**
 * Main activation function that registers event handlers and commands.
 * This is called when your extension is activated.
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
  // Listen for document changes - this subscribes to text change events in the editor
  const onTextChangeSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
    // Get the currently active text editor
    const editor = vscode.window.activeTextEditor;
    
    // Return early if there's no active editor or the change is in a different document
    if (!editor || editor.document !== event.document) {
      return;
    }
    
    // Process the changes made to the document
    // We're specifically looking for the case where the user types "${" inside a string
    for (const change of event.contentChanges) {
      // Check if the last character typed was "{"
      if (change.text === '{') {
        // Check if the previous character is "$" by looking at the text just before the current change
        const previousCharRange = new vscode.Range(
          change.range.start.translate(0, -1), // One character back from current position
          change.range.start                   // Current position
        );
        
        // Get the previous character and check if it's "$"
        if (event.document.getText(previousCharRange) === '$') {
          // If we find "${", trigger the conversion to template literals
          convertToTemplateLiterals(editor);
          break; // Only need to process once per change event
        }
      }
    }
  });
  
  // Add our subscription to the context so it gets disposed when the extension is deactivated
  context.subscriptions.push(onTextChangeSubscription);
}

/**
 * Converts string literals to template literals across all cursor positions
 * This handles the case where a user has multiple cursors in different strings
 * @param editor The VS Code text editor instance
 */
export function convertToTemplateLiterals(editor: vscode.TextEditor) {
  // Get all selections/cursors positions in the editor
  const selections = editor.selections;
  
  // Collection array to track all strings that need to be converted
  // We keep track of line number, quote positions and quote type
  const conversions: { line: number, startPos: number, endPos: number, quoteType: string }[] = [];
  
  // Process each cursor/selection position
  selections.forEach(selection => {
    // Get the active cursor position (where the user is typing)
    const cursorPosition = selection.active;
    
    // Get the text content of the current line
    const line = editor.document.lineAt(cursorPosition.line);
    const lineText = line.text;
    
    // Find the string literal that contains the cursor
    const stringInfo = findStringLiteral(lineText, cursorPosition.character);
    
    // If a valid string literal is found and it uses single or double quotes (not backticks)
    if (stringInfo && (stringInfo.quoteType === '"' || stringInfo.quoteType === "'")) {
      // Add the string to our list of strings to convert
      conversions.push({
        line: cursorPosition.line,
        startPos: stringInfo.startPos,
        endPos: stringInfo.endPos,
        quoteType: stringInfo.quoteType
      });
    }
  });
  
  // Remove duplicate conversions (can happen if multiple cursors are in the same string)
  const uniqueConversions = removeDuplicateConversions(conversions);
  
  // Only proceed if there are strings to convert
  if (uniqueConversions.length > 0) {
    // Perform all replacements in a single edit operation for better performance
    editor.edit(editBuilder => {
      // Process each string that needs conversion
      uniqueConversions.forEach(conv => {
        // Replace the opening quote with a backtick
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(conv.line, conv.startPos),    // Start of opening quote
            new vscode.Position(conv.line, conv.startPos + 1) // End of opening quote
          ),
          '`' // Replace with backtick
        );
        
        // Replace the closing quote with a backtick
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(conv.line, conv.endPos),    // Start of closing quote
            new vscode.Position(conv.line, conv.endPos + 1) // End of closing quote
          ),
          '`' // Replace with backtick
        );
      });
    }).then(success => {
      // Show a confirmation message if the edit was successful
      if (success && uniqueConversions.length > 0) {
        const count = uniqueConversions.length;
        vscode.window.showInformationMessage(
          `Converted ${count} ${count === 1 ? 'string' : 'strings'} to template literals`
        );
      }
    });
  }
}

/**
 * Analyzes a line of text to find a string literal that contains the cursor position
 * @param lineText The text of the current line
 * @param cursorPos The character position of the cursor in the line
 * @returns Object with startPos, endPos and quoteType if a string is found, null otherwise
 */
export function findStringLiteral(lineText: string, cursorPos: number): { startPos: number, endPos: number, quoteType: string } | null {
  // Initialize variables to track the string's start, end, and quote type
  let startPos = -1;
  let endPos = -1;
  let quoteType = '';
  
  // Look backwards from cursor position to find the opening quote
  for (let i = cursorPos - 1; i >= 0; i--) {
    // Check for quote characters (single or double)
    if (lineText[i] === '"' || lineText[i] === "'") {
      // Make sure this isn't an escaped quote (like \")
      if (i > 0 && lineText[i - 1] === '\\') {
        continue; // Skip escaped quotes
      }
      
      // Verify this is an opening quote by checking quote balance
      // This is a simplified approach and may not handle all complex cases
      const textBeforeQuote = lineText.substring(0, i);
      
      // Count how many times this quote character appears before this position
      const openQuoteCount = (textBeforeQuote.match(new RegExp(lineText[i], 'g')) || []).length;
      
      // If there's an even number, this is likely an opening quote
      // (This is a simplification and won't handle all nested quote scenarios)
      if (openQuoteCount % 2 === 0) {
        startPos = i;
        quoteType = lineText[i];
        break;
      }
    }
  }
  
  // If we found an opening quote, look forward to find the matching closing quote
  if (startPos !== -1) {
    for (let i = cursorPos; i < lineText.length; i++) {
      // Look for the same quote type as the opening quote
      if (lineText[i] === quoteType) {
        // Make sure this isn't an escaped quote
        if (i > 0 && lineText[i - 1] === '\\') {
          continue; // Skip escaped quotes
        }
        
        endPos = i;
        break;
      }
    }
  }
  
  // Return the string information if we found both opening and closing quotes
  if (startPos !== -1 && endPos !== -1) {
    return { startPos, endPos, quoteType };
  }
  
  // Return null if no valid string was found
  return null;
}

/**
 * Removes duplicate string literals from the conversion list
 * This prevents multiple attempts to convert the same string if there are
 * multiple cursors in the same string literal
 * @param conversions Array of string literals to be converted
 * @returns Filtered array with duplicates removed
 */
export function removeDuplicateConversions(conversions: { line: number, startPos: number, endPos: number, quoteType: string }[]) {
  // Use a Set to track unique string literals
  const uniqueKeys = new Set<string>();
  const uniqueConversions: typeof conversions = [];
  
  // Process each conversion
  for (const conv of conversions) {
    // Create a unique key for each string based on its line and position
    const key = `${conv.line}-${conv.startPos}-${conv.endPos}`;
    
    // Only add this conversion if we haven't seen it before
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueConversions.push(conv);
    }
  }
  
  return uniqueConversions;
}

/**
 * Deactivation function called when the extension is deactivated
 * Cleanup any resources here if needed
 */
export function deactivate() {
  // No specific cleanup needed for this extension
}