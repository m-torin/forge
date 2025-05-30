# Firestore Demo with React 19 Server Actions

This demo showcases how to use Cloud Firestore with React 19 Server Actions in a Next.js
application.

## Features

- Create, read, update, and delete operations with Firestore
- React 19 Server Actions for server-side data mutations
- Client components with optimistic UI updates
- Server components for data fetching
- TypeScript for type safety

## Setup

1. Make sure you have a Firebase project set up with Firestore enabled.

2. Create a service account key in the Firebase console:

   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Save the JSON file securely

3. Add the following environment variables to your `.env.local` file:

```
DATABASE_PROVIDER=firestore
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@example.com
FIREBASE_PRIVATE_KEY="your-private-key"
```

Note: Make sure to include the quotes around the private key, as it contains newlines.

## API Endpoints

The demo includes a REST API for Firestore operations:

- `GET /api/firestore` - Get all todos
- `GET /api/firestore?id=<id>` - Get a specific todo
- `POST /api/firestore` - Create a new todo
- `PATCH /api/firestore` - Update a todo
- `DELETE /api/firestore?id=<id>` - Delete a todo

## Server Actions

The demo also includes React 19 Server Actions for Firestore operations:

- `addTodo(formData)` - Create a new todo
- `getTodos()` - Get all todos
- `toggleTodoStatus(id, completed)` - Toggle a todo's completion status
- `removeTodo(id)` - Delete a todo

## Components

- `page.tsx` - The main page component that renders the todo form and list
- `todo-form.tsx` - A client component for adding new todos
- `todo-list.tsx` - A server component for displaying todos
- `todo-item.tsx` - A client component for individual todo items

## Database Structure

The demo uses a simple "todos" collection in Firestore with the following schema:

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Details

The demo uses the Firebase Admin SDK to interact with Firestore. The server actions are implemented
in the `@repo/database` package, which provides a unified interface for both Prisma and Firestore.

The database provider can be switched between Prisma and Firestore by changing the
`DATABASE_PROVIDER` environment variable.
