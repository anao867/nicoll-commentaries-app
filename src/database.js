const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/commentaries.db');
const db = new sqlite3.Database(dbPath);

const database = {
  initialize: function() {
    db.run(`
      CREATE TABLE IF NOT EXISTS commentaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        original_text TEXT NOT NULL,
        romanian_translation TEXT,
        author TEXT DEFAULT 'Maurice Nicoll',
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully!');
      }
    });
  },

  addCommentary: function(title, originalText, romanianTranslation, callback) {
    const query = `
      INSERT INTO commentaries (title, original_text, romanian_translation)
      VALUES (?, ?, ?)
    `;
    db.run(query, [title, originalText, romanianTranslation], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID });
      }
    });
  },

  getAllCommentaries: function(callback) {
    const query = 'SELECT * FROM commentaries ORDER BY date_created DESC';
    db.all(query, (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  },

  getCommentaryById: function(id, callback) {
    const query = 'SELECT * FROM commentaries WHERE id = ?';
    db.get(query, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row);
      }
    });
  },

  updateCommentary: function(id, title, originalText, romanianTranslation, callback) {
    const query = `
      UPDATE commentaries
      SET title = ?, original_text = ?, romanian_translation = ?, date_updated = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.run(query, [title, originalText, romanianTranslation, id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  deleteCommentary: function(id, callback) {
    const query = 'DELETE FROM commentaries WHERE id = ?';
    db.run(query, [id], (err) => {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  },

  searchCommentaries: function(query, callback) {
    const searchQuery = `
      SELECT * FROM commentaries
      WHERE title LIKE ? OR original_text LIKE ? OR romanian_translation LIKE ?
      ORDER BY date_created DESC
    `;
    const searchTerm = `%${query}%`;
    db.all(searchQuery, [searchTerm, searchTerm, searchTerm], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
};

module.exports = database;
