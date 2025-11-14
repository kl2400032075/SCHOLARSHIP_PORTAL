const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;
const root = path.join(__dirname);

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(root, reqPath);
    if (!filePath.startsWith(root)) {
      res.statusCode = 400;
      res.end('Bad request');
      return;
    }
    fs.stat(filePath, (err, stat) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      if (stat.isDirectory()) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Server error');
      });
      stream.pipe(res);
    });
  } catch (e) {
    res.statusCode = 500;
    res.end('Server error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server running at http://localhost:${port}/`);
});

process.on('SIGINT', () => process.exit(0));
