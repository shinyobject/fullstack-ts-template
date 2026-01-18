import { Todo } from '../api';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{
      ...styles.item,
      opacity: todo.completed ? 0.7 : 1,
    }}>
      <div style={styles.content}>
        <div style={styles.checkbox}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            style={styles.checkboxInput}
          />
        </div>
        <div style={styles.details}>
          <h3 style={{
            ...styles.title,
            textDecoration: todo.completed ? 'line-through' : 'none',
          }}>
            {todo.title}
          </h3>
          {todo.description && (
            <p style={styles.description}>{todo.description}</p>
          )}
          <p style={styles.timestamp}>
            Created: {formatDate(todo.created_at)}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        style={styles.deleteButton}
        title="Delete todo"
      >
        Delete
      </button>
    </div>
  );
}

const styles = {
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  content: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  } as React.CSSProperties,
  checkbox: {
    paddingTop: '0.25rem',
  } as React.CSSProperties,
  checkboxInput: {
    width: '1.25rem',
    height: '1.25rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  details: {
    flex: 1,
  } as React.CSSProperties,
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#333',
  } as React.CSSProperties,
  description: {
    margin: '0 0 0.5rem 0',
    color: '#666',
  } as React.CSSProperties,
  timestamp: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#999',
  } as React.CSSProperties,
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  } as React.CSSProperties,
};
