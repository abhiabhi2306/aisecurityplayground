const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'security_playground.db');

let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      
      // Create tables
      db.serialize(() => {
        // Users table for progress tracking
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_active DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Progress table
        db.run(`CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          challenge_id TEXT,
          completed BOOLEAN DEFAULT FALSE,
          attempts INTEGER DEFAULT 0,
          successful_payload TEXT,
          completed_at DATETIME,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Attempts table for learning analytics
        db.run(`CREATE TABLE IF NOT EXISTS attempts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          challenge_id TEXT,
          payload TEXT,
          success BOOLEAN,
          ai_response TEXT,
          attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        resolve();
      });
    });
  });
};

const getDatabase = () => db;

module.exports = {
  initDatabase,
  getDatabase
};
