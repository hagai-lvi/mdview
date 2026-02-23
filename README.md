# mdview

A local markdown viewer that renders markdown files in your browser with live preview, syntax highlighting, and Mermaid diagram support.

## Features

- **Live Preview**: Automatically renders markdown files in your browser
- **Syntax Highlighting**: Code blocks are highlighted using highlight.js
- **Mermaid Diagrams**: Full support for Mermaid diagrams (flowcharts, sequence diagrams, etc.)
- **GitHub-Flavored Markdown**: Tables, task lists, strikethrough, and more
- **Local Server**: Runs a lightweight local server for secure file access
- **Auto-Opens Browser**: Automatically opens your default browser to view the file

## Installation

```bash
# Clone or download the project
cd mdview

# Install dependencies
npm install

# Link globally for CLI access
npm link
```

After linking, the `mdview` command will be available globally.

## Usage

### Basic Usage

```bash
# View a markdown file
mdview README.md

# View any markdown file
mdview /path/to/your/document.md
```

### Direct Execution

```bash
# Run directly without global installation
./bin/mdview README.md
```

### Options

```bash
# Specify a custom port
mdview --port 8080 README.md
```

## How It Works

1. mdview starts a local HTTP server
2. Opens your default browser to the server URL
3. Renders the markdown file with full styling
4. The server automatically shuts down when you're done

## Supported Markdown Features

- Headings (H1-H6)
- Bold, italic, strikethrough text
- Inline and block code with syntax highlighting
- Tables (GitHub-flavored)
- Ordered and unordered lists
- Blockquotes
- Links and images
- Mermaid diagrams
- Task lists

## Dependencies

- [marked](https://github.com/markedjs/marked) - Markdown parser
- [highlight.js](https://highlightjs.org/) - Syntax highlighting
- [open](https://github.com/sindresorhus/open) - Opens URLs in the browser

## License

MIT
