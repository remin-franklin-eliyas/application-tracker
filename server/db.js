import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'tracker.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    company     TEXT    NOT NULL,
    role        TEXT    NOT NULL,
    job_url     TEXT,
    date_applied TEXT   NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'Applied',
    notes       TEXT,
    job_description TEXT,
    resume_snapshot TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
