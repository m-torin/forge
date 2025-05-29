'use client';

import { useState } from 'react';
import { Todo } from './actions';

interface TodoItemProps {
  todo: Todo;
  toggleStatus: (id: string, completed: boolean) => Promise<any>;
  removeTodo: (id: string) => Promise<any>;
}

export default function TodoItem({ todo, toggleStatus, removeTodo }: TodoItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format the date for display
  const formattedDate = todo.createdAt
    ? new Date(todo.createdAt).toLocaleString()
    : 'Unknown date';

  // Handle toggling the todo's completed status
  async function handleToggle() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await toggleStatus(todo.id, !todo.completed);

      if (!result.success) {
        setError(result.error || 'Failed to update todo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle deleting the todo
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await removeTodo(todo.id);

      if (!result.success) {
        setError(result.error || 'Failed to delete todo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <li className={`p-4 ${isLoading ? 'opacity-50' : ''}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isLoading}
          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />

        <span
          className={`ml-3 flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}
        >
          {todo.title}
        </span>

        <span className="text-xs text-gray-500 mx-2">
          {formattedDate}
        </span>

        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
          aria-label="Delete todo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </li>
  );
}
