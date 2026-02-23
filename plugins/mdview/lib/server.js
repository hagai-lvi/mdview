import http from 'node:http';
import { readFileSync } from 'node:fs';
import { watch } from 'chokidar';
import { WebSocketServer } from 'ws';
import { generateHTML } from './template.js';

/**
 * Create and start the mdview server
 * @param {string} filePath - Path to the markdown file
 * @param {Object} options - Server options
 * @param {number} [options.port=0] - Port to listen on (0 for auto-assign)
 * @returns {Promise<{server: http.Server, wss: WebSocketServer, port: number}>}
 */
export async function createServer(filePath, options = {}) {
  const preferredPort = options.port || 0;

  // Read the markdown file
  let markdownContent = readFileSync(filePath, 'utf-8');

  // Create HTTP server
  const server = http.createServer((req, res) => {
    // Re-read the file on each request to get latest content
    try {
      markdownContent = readFileSync(filePath, 'utf-8');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading markdown file');
      return;
    }

    // Serve HTML
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateHTML(markdownContent, actualPort));
  });

  // Start listening
  await new Promise((resolve, reject) => {
    server.listen(preferredPort, 'localhost', () => {
      resolve();
    });
    server.on('error', reject);
  });

  const actualPort = server.address().port;

  // Create WebSocket server on the same port
  const wss = new WebSocketServer({ server });

  // Set up file watching
  const watcher = watch(filePath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50
    }
  });

  // Broadcast to all connected clients on file change
  watcher.on('change', () => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN = 1
        client.send('reload');
      }
    });
  });

  // Clean up on server close
  server.on('close', () => {
    watcher.close();
    wss.close();
  });

  return { server, wss, port: actualPort, watcher };
}
