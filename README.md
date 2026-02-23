# mdview

A markdown viewer with live reload in a native macOS window. Designed for use with Claude Code.

## Features

- **Live reload**: Changes to the file are instantly reflected in the viewer
- **Native window**: Opens in a dedicated macOS window (not a browser tab)
- **Full rendering**: Code syntax highlighting, mermaid diagrams, tables
- **Dark mode**: Automatically matches system appearance

## Requirements

- macOS
- Node.js 18+
- Xcode Command Line Tools (for Swift compilation)

## Installation

### 1. Add the marketplace

```bash
claude plugin marketplace add hagai-lvi/mdview
```

### 2. Install the plugin

```bash
claude plugin install mdview@hagai-lvi
```

### 3. Restart Claude Code

The `mdview` skill will now be available.

## Usage

Once installed, you can ask Claude to:

- "Open the README"
- "Show me docs/guide.md"
- "Preview this markdown file"

Or Claude will proactively open markdown files for your review when creating or editing them.

## Manual Usage (CLI)

```bash
# If installed via plugin
~/.claude/plugins/cache/hagai-lvi/mdview/*/bin/mdview README.md

# Or run directly from repo
./bin/mdview README.md
```

## Development

```bash
git clone git@github.com:hagai-lvi/mdview.git
cd mdview
npm install          # Installs deps + compiles Swift viewer
npm test             # Run tests
./bin/mdview test.md # Test manually
```

## License

MIT
