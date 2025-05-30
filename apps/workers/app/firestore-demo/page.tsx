import { Suspense } from 'react';

import TodoForm from './todo-form';
import TodoList from './todo-list';

export const metadata = {
  description: 'A demo of using Firestore with React 19 Server Actions',
  title: 'Firestore Demo - React 19 Server Actions',
};

export default function FirestoreDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Firestore Demo with React 19 Server Actions</h1>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
        <TodoForm />
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Todo List</h2>
        <Suspense fallback={<div className="py-4 text-center">Loading todos...</div>}>
          <TodoList />
        </Suspense>
      </div>
    </div>
  );
}
