export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

const API_BASE = '/api/todos';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(API_BASE);
  return handleResponse<Todo[]>(response);
}

export async function fetchTodoById(id: number): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse<Todo>(response);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(response);
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Todo>(response);
}

export async function toggleTodo(id: number): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse<Todo>(response);
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}
