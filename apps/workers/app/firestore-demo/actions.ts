'use server';

import { createDocument, getDocuments, updateDocument, deleteDocument } from '@repo/database/actions/firestore-server';

// Define the Todo type
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Server action to add a new todo
export async function addTodo(formData: FormData): Promise<{ success: boolean; message: string; todo?: Todo }> {
  const title = formData.get('title') as string;

  if (!title || title.trim() === '') {
    return { success: false, message: 'Title is required' };
  }

  const todoData = {
    title: title.trim(),
    completed: false,
  };

  const result = await createDocument<Todo>('todos', todoData);

  if (!result.success) {
    return { success: false, message: result.error || 'Failed to create todo' };
  }

  return {
    success: true,
    message: 'Todo created successfully',
    todo: result.data ?? undefined
  };
}

// Server action to get all todos
export async function getTodos() {
  return getDocuments<Todo>('todos', {
    orderBy: [['createdAt', 'desc']]
  });
}

// Server action to toggle todo completion status
export async function toggleTodoStatus(id: string, completed: boolean) {
  return updateDocument<Todo>('todos', id, { completed });
}

// Server action to delete a todo
export async function removeTodo(id: string) {
  return deleteDocument<Todo>('todos', id);
}
