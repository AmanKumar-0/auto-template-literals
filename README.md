# Auto Template Literals

A Visual Studio Code extension that automatically converts string literals (with single or double quotes) to template literals (with backticks) when you type `${` inside a string. This saves you time and helps prevent syntax errors when working with JavaScript and TypeScript.

## Features

- **Automatic Conversion**: When you type `${` inside a string with single (`'`) or double (`"`) quotes, the extension automatically converts the quotes to backticks (`` ` ``).
- **Multi-Cursor Support**: Works with multiple cursors simultaneously - perfect for batch editing.
- **Notification**: Shows a notification confirming how many strings were converted.

## How It Works

1. Start typing in a string literal with single or double quotes:
   ```javascript
   const message = "Hello, ";
   ```

2. When you want to use a template expression, type `${`:
   ```javascript
   const message = "Hello, ${
   ```

3. The extension automatically converts the quotes to backticks:
   ```javascript
   const message = `Hello, ${
   ```

4. You can now complete your template expression:
   ```javascript
   const message = `Hello, ${name}`;
   ```

## Use Cases

- **Dynamic String Construction**: When adding variables to strings
- **Multiline Strings**: When you need to expand a single-line string to multiple lines
- **String Interpolation**: When you need to include expressions in your strings

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Extension Settings

This extension does not add any settings.

## Known Limitations

- Currently works only with single-line strings
- The string detection algorithm uses a simplified approach that might not handle all complex nested string cases
- Does not handle strings that span multiple lines

## Future Enhancements

Planned improvements:
- Support for multi-line strings
- Options to customize behavior
- More robust string detection in complex code

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Auto Template Literals"
4. Click Install

## Manual Installation

If you prefer to install manually:
1. Download the .vsix file from the [releases page](https://github.com/yourusername/auto-template-literals/releases)
2. In VS Code, open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Type "Extensions: Install from VSIX" and select it
4. Choose the downloaded .vsix file

## How It Works Under the Hood

This extension:

1. **Monitors Document Changes**: Listens for text changes in the editor
2. **Detects Template Expression Start**: Identifies when the user types `${`
3. **Analyzes String Context**: Determines if the cursor is inside a string literal
4. **Converts Quotes**: Replaces the opening and closing quotes with backticks

The string detection algorithm:
- Searches backward from the cursor to find the opening quote
- Ensures the quote isn't escaped (e.g., `\"`)
- Performs a basic balance check to handle nested quotes
- Searches forward to find the matching closing quote

## Development

Want to contribute? Great! Here's how to set up the development environment:

1. Clone the repository:
   ```
   git clone https://github.com/AmanKumar-0/auto-template-literals.git
   ```

2. Install dependencies:
   ```
   cd auto-template-literals
   npm install
   ```

3. Open in VS Code:
   ```
   code .
   ```

4. Press F5 to launch the extension in development mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Release Notes

### 0.0.1

- Initial release
- Automatic conversion of string literals to template literals
- Multi-cursor support

### 0.0.2

- Updated README.md

---

**Enjoy!** 🚀