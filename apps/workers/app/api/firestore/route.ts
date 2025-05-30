import { type NextRequest, NextResponse } from 'next/server';

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

// GET handler to retrieve all todos or a specific todo
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id) {
    // Get a specific todo by ID
    await adapter.initialize();
    const result = await adapter.findUnique<Todo>('todos', { where: { id } });
    return NextResponse.json(result);
  } else {
    // Get all todos
    await adapter.initialize();
    const result = await adapter.findMany<Todo>('todos', {
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(result);
  }
}

// POST handler to create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'Title is required', success: false }, { status: 400 });
    }

    const todoData = {
      completed: body.completed === true,
      title: body.title.trim(),
    };

    await adapter.initialize();
    const result = await adapter.create<Todo>('todos', todoData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid request body',
        success: false,
      },
      { status: 400 },
    );
  }
}

// PATCH handler to update a todo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'ID is required', success: false }, { status: 400 });
    }

    const updateData: Partial<Todo> = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.completed !== undefined) {
      updateData.completed = !!body.completed;
    }

    await adapter.initialize();
    const result = await adapter.update<Todo>('todos', body.id, updateData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invalid request body',
        success: false,
      },
      { status: 400 },
    );
  }
}

// DELETE handler to delete a todo
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required', success: false }, { status: 400 });
  }

  await adapter.initialize();
  const result = await adapter.delete<Todo>('todos', id);
  return NextResponse.json(result);
}
