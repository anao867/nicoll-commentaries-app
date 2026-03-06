const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./src/database');
const routes = require('./src/routes');

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3000;
const MAX_PORT_RETRIES = Number(process.env.PORT_RETRIES) || 10;
const isProduction = process.env.NODE_ENV === 'production';
const publicWriteEnabled = process.env.PUBLIC_WRITE_ENABLED === 'true';
const writeEnabled = !isProduction || publicWriteEnabled;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/glossary', express.static(path.join(__dirname, '../4thWayGlossary')));

// Initialize database
db.initialize();

// API Routes
app.use('/api', routes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: writeEnabled ? 'read-write' : 'read-only',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/backup', (req, res) => {
  if (db.getEngine() !== 'sqlite') {
    return res.status(400).json({
      error: 'Database file backup is only available in SQLite mode.'
    });
  }

  const dbFilePath = path.join(__dirname, 'data', 'commentaries.db');
  const timestamp = new Date().toISOString().replace(/[.:]/g, '-');
  const backupFileName = `commentaries-backup-${timestamp}.db`;

  res.download(dbFilePath, backupFileName, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Failed to export database backup' });
    }
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

function startServer(port, retriesLeft) {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, retrying on port ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    if (err.code === 'EADDRINUSE') {
      console.error(`Could not find a free port after ${MAX_PORT_RETRIES + 1} attempts starting at ${BASE_PORT}.`);
    } else {
      console.error('Server failed to start:', err.message);
    }

    process.exit(1);
  });
}

startServer(BASE_PORT, MAX_PORT_RETRIES);
