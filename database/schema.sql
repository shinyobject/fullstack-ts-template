-- Todo App Database Schema

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries on completion status
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
