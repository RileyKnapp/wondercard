import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run injects PORT, usually 8080.
const port = process.env.PORT || 8080;

// The Dockerfile builds assets to ./dist
const distPath = path.join(__dirname, 'dist');

console.log(`[Server] Starting...`);
console.log(`[Server] Target Port: ${port}`);
console.log(`[Server] Serving static files from: ${distPath}`);

// Verify dist folder exists to help with debugging logs
if (!fs.existsSync(distPath)) {
  console.error(`[CRITICAL] 'dist' folder missing! Build might have failed.`);
  try {
    console.log(`[Debug] Contents of root:`, fs.readdirSync(__dirname));
  } catch (e) {
    console.error(e);
  }
}

// Serve static assets
app.use(express.static(distPath));

// SPA Fallback: Send index.html for any unknown route
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application Loading... (Index not found)');
  }
});

// Bind to 0.0.0.0 (Required for Cloud Run)
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server listening on 0.0.0.0:${port}`);
});