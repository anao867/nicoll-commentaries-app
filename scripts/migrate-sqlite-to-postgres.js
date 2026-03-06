const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const sqlitePath = path.join(__dirname, '..', 'data', 'commentaries.db');

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL. Example: postgres://user:pass@host:5432/dbname');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

const sqliteDb = new sqlite3.Database(sqlitePath);

const ensureTableSql = `
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

const fetchSqliteRows = () => {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM commentaries ORDER BY id ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

const migrate = async () => {
  console.log('Starting SQLite -> PostgreSQL migration...');

  await pool.query(ensureTableSql);
  const rows = await fetchSqliteRows();

  if (rows.length === 0) {
    console.log('No rows found in SQLite. Nothing to migrate.');
    return;
  }

  let inserted = 0;

  for (const row of rows) {
    const query = `
      INSERT INTO commentaries (title, original_text, romanian_translation, author, date_created, date_updated)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (title) DO NOTHING
    `;

    const values = [
      row.title,
      row.original_text,
      row.romanian_translation || null,
      row.author || 'Maurice Nicoll',
      row.date_created || new Date().toISOString(),
      row.date_updated || new Date().toISOString()
    ];

    const result = await pool.query(query, values);
    inserted += result.rowCount;
  }

  console.log(`Migration complete. Inserted ${inserted} of ${rows.length} records.`);
};

migrate()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqliteDb.close();
    await pool.end();
  });
