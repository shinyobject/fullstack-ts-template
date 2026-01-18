import { useState, useEffect } from 'react';
import {
  fetchTodos,
  createTodo,
  toggleTodo,
  deleteTodo,
  Todo,
  CreateTodoInput,
} from './api';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('Failed to load todos. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (input: CreateTodoInput) => {
    const newTodo = await createTodo(input);
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleTodo(id);
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? updated : todo))
      );
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      alert('Failed to update todo. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      alert('Failed to delete todo. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Todo App</h1>
        <p style={styles.subtitle}>A simple todo application with SQLite</p>
      </header>

      <main style={styles.main}>
        <AddTodo onAdd={handleAdd} />

        {isLoading && (
          <div style={styles.loading}>Loading todos...</div>
        )}

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {!isLoading && !error && (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer style={styles.footer}>
        <p>Total: {todos.length} | Active: {todos.filter(t => !t.completed).length} | Completed: {todos.filter(t => t.completed).length}</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  } as React.CSSProperties,
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#333',
    margin: '0 0 0.5rem 0',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '1rem',
    color: '#777',
    margin: 0,
  } as React.CSSProperties,
  main: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center',
    padding: '1rem',
    borderTop: '1px solid #e0e0e0',
    color: '#666',
  } as React.CSSProperties,
};
