const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL CHECK(length(full_name) BETWEEN 2 AND 50),
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL CHECK(length(phone) = 10),
      role TEXT NOT NULL CHECK(role IN ('Admin', 'User', 'Guest')),
      password TEXT NOT NULL CHECK(length(password) >= 8)
    )
  `, (err) => {
    if (err) {
      console.error('Migration failed:', err.message);
      process.exitCode = 1;
    } else {
      console.log('Migration completed: users table is ready.');
    }
    db.close();
  });
});
