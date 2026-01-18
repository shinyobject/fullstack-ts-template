import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Todo, CreateTodoInput, UpdateTodoInput } from './types';

const DB_PATH = process.env.DB_PATH || join(__dirname, '../database/todos.db');

// Initialize database connection
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  const schemaPath = join(__dirname, '../../database/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database initialized successfully');
}

// Initialize on module load
initializeDatabase();

// Get all todos
export function getAllTodos(): Todo[] {
  const stmt = db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
  return stmt.all() as Todo[];
}

// Get a single todo by ID
export function getTodoById(id: number): Todo | undefined {
  const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
  return stmt.get(id) as Todo | undefined;
}

// Create a new todo
export function createTodo(input: CreateTodoInput): Todo {
  const stmt = db.prepare(
    'INSERT INTO todos (title, description) VALUES (?, ?)'
  );
  const result = stmt.run(input.title, input.description || null);

  const newTodo = getTodoById(result.lastInsertRowid as number);
  if (!newTodo) {
    throw new Error('Failed to create todo');
  }

  return newTodo;
}

// Update an existing todo
export function updateTodo(id: number, input: UpdateTodoInput): Todo | null {
  const existing = getTodoById(id);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    values.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }

  if (input.completed !== undefined) {
    updates.push('completed = ?');
    values.push(input.completed ? 1 : 0);
  }

  if (updates.length === 0) {
    return existing;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`
  );
  stmt.run(...values);

  return getTodoById(id) || null;
}

// Toggle todo completion status
export function toggleTodo(id: number): Todo | null {
  const todo = getTodoById(id);
  if (!todo) {
    return null;
  }

  return updateTodo(id, { completed: !todo.completed });
}

// Delete a todo
export function deleteTodo(id: number): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Close database connection (for graceful shutdown)
export function closeDatabase() {
  db.close();
}

export default db;
