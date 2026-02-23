# mdview

Open markdown files in a native macOS viewer with live preview.

## When to Use

Use this skill when:
- User asks to "open", "show", "preview", or "view" a markdown file
- You create or edit a markdown file that the user should review
- You want to show rendered markdown to the user

## Usage

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/mdview" <path-to-markdown-file>
```

**Note:** `CLAUDE_PLUGIN_ROOT` is automatically set to this plugin's installation directory.

## Examples

**User requests:**
- "Open the README"
- "Show me the docs"
- "Preview this markdown"
- "View CHANGELOG.md"

**When Claude creates/edits markdown:**
After creating or editing a markdown file that needs user review:

```bash
"${CLAUDE_PLUGIN_ROOT}/bin/mdview" README.md
```

## Features

- **Live reload**: Changes to the file are instantly reflected in the viewer
- **Native window**: Opens in a dedicated macOS window (not a browser tab)
- **Full rendering**: Code syntax highlighting, mermaid diagrams, tables, math
- **Dark mode**: Automatically matches system appearance

## Requirements

- macOS (uses native WebKit viewer)
- Node.js 18+

## Installation

This skill is part of the mdview plugin. Install via:

```bash
git clone https://github.com/hagail/mdview ~/.claude/plugins/mdview
cd ~/.claude/plugins/mdview && npm install && npm run build:viewer
```
