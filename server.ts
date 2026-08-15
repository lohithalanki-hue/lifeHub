import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiMiddleware from './src/server-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// PORT is hardcoded by infrastructure to 3000
const PORT = 3000;

// Setup body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes middleware
app.use('/api', apiMiddleware);

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: redirect all non-api traffic to client router index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production Express server running at http://0.0.0.0:${PORT}`);
});
