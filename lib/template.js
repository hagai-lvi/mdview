/**
 * HTML template generator for mdview
 */

/**
 * Generate HTML page with markdown content and all required CDN libraries
 * @param {string} markdownContent - Raw markdown content
 * @param {number} wsPort - WebSocket port for live reload
 * @returns {string} - Complete HTML page
 */
export function generateHTML(markdownContent, wsPort) {
  const escapedContent = markdownContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mdview</title>

  <!-- highlight.js CSS for code highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">

  <!-- GitHub-style markdown CSS -->
  <style>
    :root {
      --color-canvas-default: #0d1117;
      --color-canvas-subtle: #161b22;
      --color-border-default: #30363d;
      --color-border-muted: #21262d;
      --color-fg-default: #e6edf3;
      --color-fg-muted: #848d97;
      --color-accent-fg: #58a6ff;
    }

    @media (prefers-color-scheme: light) {
      :root {
        --color-canvas-default: #ffffff;
        --color-canvas-subtle: #f6f8fa;
        --color-border-default: #d0d7de;
        --color-border-muted: #d8dee4;
        --color-fg-default: #1f2328;
        --color-fg-muted: #656d76;
        --color-accent-fg: #0969da;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      word-wrap: break-word;
      background-color: var(--color-canvas-default);
      color: var(--color-fg-default);
      margin: 0;
      padding: 32px;
    }

    .markdown-body {
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      background-color: var(--color-canvas-default);
    }

    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }

    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    .markdown-body h1 {
      font-size: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--color-border-muted);
    }

    .markdown-body h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--color-border-muted);
    }

    .markdown-body h3 {
      font-size: 1.25em;
    }

    .markdown-body p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .markdown-body a {
      color: var(--color-accent-fg);
      text-decoration: none;
    }

    .markdown-body a:hover {
      text-decoration: underline;
    }

    .markdown-body code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      white-space: break-spaces;
      background-color: var(--color-canvas-subtle);
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
    }

    .markdown-body pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: var(--color-canvas-subtle);
      border-radius: 6px;
    }

    .markdown-body pre code {
      padding: 0;
      margin: 0;
      overflow: visible;
      line-height: inherit;
      word-wrap: normal;
      background-color: transparent;
      border: 0;
      font-size: 100%;
    }

    .markdown-body blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: var(--color-fg-muted);
      border-left: 0.25em solid var(--color-border-default);
    }

    .markdown-body ul,
    .markdown-body ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }

    .markdown-body li + li {
      margin-top: 0.25em;
    }

    .markdown-body table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-bottom: 16px;
      width: max-content;
      max-width: 100%;
      overflow: auto;
    }

    .markdown-body table th,
    .markdown-body table td {
      padding: 6px 13px;
      border: 1px solid var(--color-border-default);
    }

    .markdown-body table tr {
      background-color: var(--color-canvas-default);
      border-top: 1px solid var(--color-border-muted);
    }

    .markdown-body table tr:nth-child(2n) {
      background-color: var(--color-canvas-subtle);
    }

    .markdown-body hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--color-border-default);
      border: 0;
    }

    .markdown-body img {
      max-width: 100%;
      box-sizing: content-box;
    }

    .markdown-body strong {
      font-weight: 600;
    }

    /* Mermaid diagrams */
    .mermaid {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="markdown-body" id="content">
    <!-- Markdown content will be rendered here -->
  </div>

  <!-- marked.js for markdown parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <!-- highlight.js for code syntax highlighting -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

  <!-- mermaid.js for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>

  <script>
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default'
    });

    // Configure marked with highlight.js
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });

    // Raw markdown content
    const markdownContent = \`${escapedContent}\`;

    // Render markdown
    function renderMarkdown(content) {
      document.getElementById('content').innerHTML = marked.parse(content);

      // Re-highlight code blocks
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });

      // Render mermaid diagrams
      document.querySelectorAll('code.language-mermaid').forEach((block) => {
        const pre = block.parentElement;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = block.textContent;
        pre.replaceWith(div);
      });

      mermaid.run();
    }

    // Initial render
    renderMarkdown(markdownContent);

    // WebSocket for live reload
    const ws = new WebSocket('ws://localhost:${wsPort}');

    ws.onmessage = function(event) {
      const data = event.data;
      if (data === 'reload') {
        // Full page reload on file change
        window.location.reload();
      } else {
        // If content is sent, re-render it
        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            renderMarkdown(parsed.content);
          }
        } catch (e) {
          // If not JSON, might be a reload signal
          if (data.includes('reload') || data.includes('update')) {
            window.location.reload();
          }
        }
      }
    };

    ws.onclose = function() {
      console.log('WebSocket connection closed. Server may have stopped.');
    };

    ws.onerror = function(error) {
      console.error('WebSocket error:', error);
    };
  </script>
</body>
</html>`;
}
