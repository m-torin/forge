import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';
import { createDocument } from '../actions';

export async function GET(request: NextRequest) {
  try {
    // Try to create document normally first
    const result = await createDocument();
    return NextResponse.redirect(new URL(`/editor/${result.id}`, request.url));
  } catch (error) {
    console.warn('Database unavailable, using localStorage mode:', error);

    // If database fails, generate a temporary ID and redirect to localStorage mode
    const tempId = `temp-${nanoid()}`;
    const url = new URL(`/editor/${tempId}`, request.url);
    url.searchParams.set('mode', 'localStorage');

    return NextResponse.redirect(url);
  }
}
