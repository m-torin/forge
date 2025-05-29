import { NextRequest, NextResponse } from 'next/server';
import { createDocument, getDocuments, getDocument, updateDocument, deleteDocument } from '@repo/database/actions/firestore-server';

// Define the Todo type
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// GET handler to retrieve all todos or a specific todo
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id) {
    // Get a specific todo by ID
    const result = await getDocument<Todo>('todos', id);
    return NextResponse.json(result);
  } else {
    // Get all todos
    const result = await getDocuments<Todo>('todos', {
      orderBy: [['createdAt', 'desc']]
    });
    return NextResponse.json(result);
  }
}

// POST handler to create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const todoData = {
      title: body.title.trim(),
      completed: body.completed === true,
    };

    const result = await createDocument<Todo>('todos', todoData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request body'
      },
      { status: 400 }
    );
  }
}

// PATCH handler to update a todo
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const updateData: Partial<Todo> = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
    }

    if (body.completed !== undefined) {
      updateData.completed = !!body.completed;
    }

    const result = await updateDocument<Todo>('todos', body.id, updateData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request body'
      },
      { status: 400 }
    );
  }
}

// DELETE handler to delete a todo
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID is required' },
      { status: 400 }
    );
  }

  const result = await deleteDocument<Todo>('todos', id);
  return NextResponse.json(result);
}
