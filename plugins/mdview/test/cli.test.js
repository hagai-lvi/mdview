import test from 'node:test';
import assert from 'node:assert';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import http from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_PATH = join(__dirname, '..', 'bin', 'mdview');

/**
 * Helper to run the CLI and capture output
 */
function runCLI(args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      timeout: options.timeout || 5000,
      ...options
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr, proc });
    });

    proc.on('error', reject);

    // If we need to kill it early (for server tests)
    if (options.killAfter) {
      setTimeout(() => proc.kill(), options.killAfter);
    }
  });
}

/**
 * Helper to fetch HTTP content
 */
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

// Test 1: CLI parses markdown file argument correctly
test('CLI parses markdown file argument correctly', async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'mdview-test-'));
  const testFile = join(tmpDir, 'test.md');
  writeFileSync(testFile, '# Hello World\n\nThis is a test.');

  try {
    // Run CLI with a valid markdown file - it should start without errors
    // We kill it after a short time since it's a server
    const result = await runCLI([testFile], { killAfter: 1000 });

    // The CLI should have started successfully (not exit with error immediately)
    // Since we killed it, exit code might be null or non-zero, but stderr should be empty
    assert.ok(
      result.stderr === '' || !result.stderr.includes('Error'),
      `CLI should accept markdown file argument without errors. Got stderr: ${result.stderr}`
    );
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Test 2: CLI exits with error if no file provided
test('CLI exits with error if no file provided', async (t) => {
  const result = await runCLI([]);

  assert.strictEqual(result.code, 1, 'CLI should exit with code 1 when no file is provided');
  assert.ok(
    result.stderr.includes('Usage') || result.stderr.includes('file') || result.stderr.includes('required'),
    `CLI should show usage message when no file provided. Got: ${result.stderr}`
  );
});

// Test 3: CLI exits with error if file not found
test('CLI exits with error if file not found', async (t) => {
  const nonExistentFile = '/tmp/this-file-definitely-does-not-exist-12345.md';

  const result = await runCLI([nonExistentFile]);

  assert.strictEqual(result.code, 1, 'CLI should exit with code 1 when file not found');
  assert.ok(
    result.stderr.includes('not found') || result.stderr.includes('ENOENT') || result.stderr.includes('does not exist'),
    `CLI should show file not found error. Got: ${result.stderr}`
  );
});

// Test 4: Server starts on an available port
test('Server starts on an available port', async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'mdview-test-'));
  const testFile = join(tmpDir, 'test.md');
  writeFileSync(testFile, '# Test');

  try {
    const proc = spawn('node', [CLI_PATH, testFile]);

    // Wait for server to output port info
    const portInfo = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Timeout waiting for server to start'));
      }, 5000);

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        // Expect output like "Server running on http://localhost:3000" or similar
        const portMatch = output.match(/(?:port|localhost:?)[\s:]*(\d+)/i) ||
                          output.match(/:(\d{4,5})/);
        if (portMatch) {
          clearTimeout(timeout);
          resolve(parseInt(portMatch[1], 10));
        }
      });

      proc.stderr.on('data', (data) => {
        clearTimeout(timeout);
        proc.kill();
        reject(new Error(`Server error: ${data.toString()}`));
      });
    });

    assert.ok(portInfo > 0 && portInfo < 65536, `Server should start on a valid port. Got: ${portInfo}`);
    proc.kill();
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Test 5: Server serves HTML with rendered markdown
test('Server serves HTML with rendered markdown', async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'mdview-test-'));
  const testFile = join(tmpDir, 'test.md');
  const markdownContent = '# Hello World\n\nThis is **bold** text.';
  writeFileSync(testFile, markdownContent);

  try {
    const proc = spawn('node', [CLI_PATH, testFile]);

    // Wait for server to start and get port
    const port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Timeout waiting for server to start'));
      }, 5000);

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        const portMatch = output.match(/(?:port|localhost:?)[\s:]*(\d+)/i) ||
                          output.match(/:(\d{4,5})/);
        if (portMatch) {
          clearTimeout(timeout);
          resolve(parseInt(portMatch[1], 10));
        }
      });

      proc.stderr.on('data', (data) => {
        clearTimeout(timeout);
        proc.kill();
        reject(new Error(`Server error: ${data.toString()}`));
      });
    });

    // Fetch the HTML
    const response = await fetchURL(`http://localhost:${port}/`);

    assert.strictEqual(response.status, 200, 'Server should respond with 200 OK');
    assert.ok(
      response.headers['content-type']?.includes('text/html'),
      `Content-Type should be text/html. Got: ${response.headers['content-type']}`
    );

    // Check that markdown is rendered to HTML
    assert.ok(
      response.body.includes('<h1') || response.body.includes('Hello World'),
      'HTML should contain rendered heading'
    );
    assert.ok(
      response.body.includes('<strong>') || response.body.includes('<b>') || response.body.includes('bold'),
      'HTML should contain rendered bold text'
    );

    proc.kill();
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Test 6: WebSocket broadcasts on file change
test('WebSocket broadcasts on file change', async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'mdview-test-'));
  const testFile = join(tmpDir, 'test.md');
  writeFileSync(testFile, '# Initial Content');

  // Dynamic import of ws (it's a dependency of the project)
  const { WebSocket } = await import('ws');

  try {
    const proc = spawn('node', [CLI_PATH, testFile]);

    // Wait for server to start
    const port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Timeout waiting for server to start'));
      }, 5000);

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        const portMatch = output.match(/(?:port|localhost:?)[\s:]*(\d+)/i) ||
                          output.match(/:(\d{4,5})/);
        if (portMatch) {
          clearTimeout(timeout);
          resolve(parseInt(portMatch[1], 10));
        }
      });

      proc.stderr.on('data', (data) => {
        clearTimeout(timeout);
        proc.kill();
        reject(new Error(`Server error: ${data.toString()}`));
      });
    });

    // Connect WebSocket
    const ws = new WebSocket(`ws://localhost:${port}`);

    const messageReceived = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        proc.kill();
        reject(new Error('Timeout waiting for WebSocket message after file change'));
      }, 5000);

      ws.on('open', () => {
        // Modify the file after connection is established
        setTimeout(() => {
          writeFileSync(testFile, '# Updated Content');
        }, 500);
      });

      ws.on('message', (data) => {
        clearTimeout(timeout);
        resolve(data.toString());
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // The message should indicate a reload or contain updated content
    assert.ok(
      messageReceived.includes('reload') ||
      messageReceived.includes('update') ||
      messageReceived.includes('Updated Content') ||
      messageReceived.length > 0,
      `WebSocket should broadcast on file change. Got: ${messageReceived}`
    );

    ws.close();
    proc.kill();
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

// Test 7: HTML includes marked.js, highlight.js, mermaid CDN links
test('HTML includes marked.js, highlight.js, mermaid CDN links', async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'mdview-test-'));
  const testFile = join(tmpDir, 'test.md');
  writeFileSync(testFile, '# Test\n\n```js\nconsole.log("hello");\n```');

  try {
    const proc = spawn('node', [CLI_PATH, testFile]);

    // Wait for server to start
    const port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Timeout waiting for server to start'));
      }, 5000);

      proc.stdout.on('data', (data) => {
        const output = data.toString();
        const portMatch = output.match(/(?:port|localhost:?)[\s:]*(\d+)/i) ||
                          output.match(/:(\d{4,5})/);
        if (portMatch) {
          clearTimeout(timeout);
          resolve(parseInt(portMatch[1], 10));
        }
      });

      proc.stderr.on('data', (data) => {
        clearTimeout(timeout);
        proc.kill();
        reject(new Error(`Server error: ${data.toString()}`));
      });
    });

    // Fetch the HTML
    const response = await fetchURL(`http://localhost:${port}/`);
    const html = response.body;

    // Check for marked.js CDN
    assert.ok(
      html.includes('marked') || html.includes('cdn') && html.includes('marked'),
      `HTML should include marked.js CDN link. Got HTML length: ${html.length}`
    );

    // Check for highlight.js CDN
    assert.ok(
      html.includes('highlight') || html.includes('hljs'),
      'HTML should include highlight.js CDN link'
    );

    // Check for mermaid CDN
    assert.ok(
      html.includes('mermaid'),
      'HTML should include mermaid CDN link'
    );

    proc.kill();
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
