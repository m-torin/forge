'use server';

import { createFirestoreAdapter } from '@repo/database/firestore';

// Create adapter instance
const adapter = createFirestoreAdapter();

// Define the Todo type
export interface Todo {
  completed: boolean;
  createdAt?: Date;
  id: string;
  title: string;
  updatedAt?: Date;
}

// Server action to add a new todo
export async function addTodo(
  formData: FormData,
): Promise<{ success: boolean; message: string; todo?: Todo }> {
  const title = formData.get('title') as string;

  if (!title || title.trim() === '') {
    return { message: 'Title is required', success: false };
  }

  const todoData = {
    completed: false,
    title: title.trim(),
  };

  try {
    await adapter.initialize();
    const result = await adapter.create<Todo>('todos', todoData);

    return {
      message: 'Todo created successfully',
      success: true,
      todo: result,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Failed to create todo',
      success: false,
    };
  }
}

// Server action to get all todos
export async function getTodos() {
  try {
    await adapter.initialize();
    const result = await adapter.findMany<Todo>('todos', {
      orderBy: { createdAt: 'desc' },
    });
    return { data: result, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get todos',
      success: false,
    };
  }
}

// Server action to toggle todo completion status
export async function toggleTodoStatus(id: string, completed: boolean) {
  try {
    await adapter.initialize();
    const result = await adapter.update<Todo>('todos', id, { completed });
    return { data: result, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update todo',
      success: false,
    };
  }
}

// Server action to delete a todo
export async function removeTodo(id: string) {
  try {
    await adapter.initialize();
    const result = await adapter.delete<Todo>('todos', id);
    return { data: result, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete todo',
      success: false,
    };
  }
}
