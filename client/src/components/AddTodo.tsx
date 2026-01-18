import { useState, FormEvent } from 'react';
import { CreateTodoInput } from '../api';

interface AddTodoProps {
  onAdd: (input: CreateTodoInput) => Promise<void>;
}

export default function AddTodo({ onAdd }: AddTodoProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Failed to add todo:', error);
      alert('Failed to add todo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Todo title"
          style={styles.input}
          disabled={isSubmitting}
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          style={styles.input}
          disabled={isSubmitting}
        />
      </div>
      <button type="submit" style={styles.button} disabled={isSubmitting || !title.trim()}>
        {isSubmitting ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  } as React.CSSProperties,
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  } as React.CSSProperties,
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  } as React.CSSProperties,
};
