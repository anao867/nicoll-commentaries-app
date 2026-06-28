const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Pool } = require('pg');

const isPostgres = Boolean(process.env.DATABASE_URL);

function buildPostgresConfig() {
  const connectionString = process.env.DATABASE_URL;
  const sslMode = (process.env.PGSSLMODE || '').toLowerCase();
  const databaseSsl = (process.env.DATABASE_SSL || '').toLowerCase();

  if (!connectionString) {
    return null;
  }

  const config = { connectionString };

  if (
    databaseSsl === 'false' ||
    ['disable', 'allow', 'prefer'].includes(sslMode)
  ) {
    config.ssl = false;
    return config;
  }

  let sslRequestedInUrl = false;

  try {
    const databaseUrl = new URL(connectionString);
    const urlSslMode = (databaseUrl.searchParams.get('sslmode') || '').toLowerCase();
    const urlSsl = (databaseUrl.searchParams.get('ssl') || '').toLowerCase();

    sslRequestedInUrl = [
      'require',
      'verify-ca',
      'verify-full',
      'no-verify'
    ].includes(urlSslMode) || ['true', '1'].includes(urlSsl);
  } catch (error) {
    sslRequestedInUrl = false;
  }

  if (
    databaseSsl === 'true' ||
    ['require', 'verify-ca', 'verify-full', 'no-verify'].includes(sslMode) ||
    sslRequestedInUrl
  ) {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

const sqliteDbPath = path.join(__dirname, '../data/commentaries.db');
const sqliteDb = isPostgres ? null : new sqlite3.Database(sqliteDbPath);
const pgPool = isPostgres
  ? new Pool(buildPostgresConfig())
  : null;

const createTableSqlite = `
  CREATE TABLE IF NOT EXISTS commentaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL UNIQUE,
    original_text TEXT NOT NULL,
    romanian_translation TEXT,
    author TEXT DEFAULT 'Maurice Nicoll',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createTablePostgres = `
  CREATE TABLE IF NOT EXISTS commentaries (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    original_text TEXT NOT NULL,
    romanian_translation TEXT,
    author TEXT DEFAULT 'Maurice Nicoll',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const database = {
  getEngine: function() {
    return isPostgres ? 'postgres' : 'sqlite';
  },

  initialize: function() {
    if (isPostgres) {
      pgPool.query(createTablePostgres)
        .then(() => {
          console.log('Database initialized successfully! (postgres)');
        })
        .catch((err) => {
          console.error('Error creating table:', err.message);
        });
      return;
    }

    sqliteDb.run(createTableSqlite, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully! (sqlite)');
      }
    });
  },

  checkHealth: async function() {
    if (isPostgres) {
      await pgPool.query('SELECT 1');
      return { engine: 'postgres', status: 'ok' };
    }

    return new Promise((resolve, reject) => {
      sqliteDb.get('SELECT 1', (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({ engine: 'sqlite', status: 'ok' });
      });
    });
  },

  addCommentary: function(title, originalText, romanianTranslation, callback) {
    if (isPostgres) {
      const query = `
        INSERT INTO commentaries (title, original_text, romanian_translation)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      pgPool.query(query, [title, originalText, romanianTranslation || null])
        .then((result) => callback(null, { id: result.rows[0].id }))
        .catch((err) => callback(err, null));
      return;
    }

    const query = `
      INSERT INTO commentaries (title, original_text, romanian_translation)
      VALUES (?, ?, ?)
    `;
    sqliteDb.run(query, [title, originalText, romanianTranslation], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID });
      }
    });
  },

  getAllCommentaries: function(callback) {
    const query = 'SELECT * FROM commentaries ORDER BY date_created DESC';

    if (isPostgres) {
      pgPool.query(query)
        .then((result) => callback(null, result.rows))
        .catch((err) => callback(err, null));
      return;
    }

    sqliteDb.all(query, (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  getCommentaryById: function(id, callback) {
    if (isPostgres) {
      const query = 'SELECT * FROM commentaries WHERE id = $1';
      pgPool.query(query, [id])
        .then((result) => callback(null, result.rows[0] || null))
        .catch((err) => callback(err, null));
      return;
    }

    const query = 'SELECT * FROM commentaries WHERE id = ?';
    sqliteDb.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  updateCommentary: function(id, title, originalText, romanianTranslation, callback) {
    if (isPostgres) {
      const query = `
        UPDATE commentaries
        SET title = $1, original_text = $2, romanian_translation = $3, date_updated = CURRENT_TIMESTAMP
        WHERE id = $4
      `;

      pgPool.query(query, [title, originalText, romanianTranslation || null, id])
        .then(() => callback(null))
        .catch((err) => callback(err));
      return;
    }

    const query = `
      UPDATE commentaries
      SET title = ?, original_text = ?, romanian_translation = ?, date_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    sqliteDb.run(query, [title, originalText, romanianTranslation, id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  deleteCommentary: function(id, callback) {
    if (isPostgres) {
      const query = 'DELETE FROM commentaries WHERE id = $1';
      pgPool.query(query, [id])
        .then(() => callback(null))
        .catch((err) => callback(err));
      return;
    }

    const query = 'DELETE FROM commentaries WHERE id = ?';
    sqliteDb.run(query, [id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  searchCommentaries: function(query, callback) {
    const searchTerm = `%${query}%`;

    if (isPostgres) {
      const searchQuery = `
        SELECT * FROM commentaries
        WHERE title ILIKE $1 OR original_text ILIKE $2 OR romanian_translation ILIKE $3
        ORDER BY date_created DESC
      `;

      pgPool.query(searchQuery, [searchTerm, searchTerm, searchTerm])
        .then((result) => callback(null, result.rows))
        .catch((err) => callback(err, null));
      return;
    }

    const searchQuery = `
      SELECT * FROM commentaries
      WHERE title LIKE ? OR original_text LIKE ? OR romanian_translation LIKE ?
      ORDER BY date_created DESC
    `;
    sqliteDb.all(searchQuery, [searchTerm, searchTerm, searchTerm], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
};

module.exports = database;
