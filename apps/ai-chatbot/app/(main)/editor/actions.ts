'use server';

import {
  deleteEditorDocumentById,
  getDocumentsById,
  saveEditorDocument,
  updateEditorDocument,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '../../(auth)/auth';

export async function createDocument(): Promise<{ id: string }> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const documentId = generateUUID();

  try {
    // Create initial document in database
    await saveEditorDocument({
      id: documentId,
      title: 'Untitled Document',
      content: '',
      userId: session.user.id,
    });
  } catch (error) {
    console.error('Failed to create document:', error);
    // Check if it's a foreign key constraint violation (user doesn't exist)
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      console.warn(
        'User not found in database, likely a stale session. Document will work in localStorage mode.',
      );
    }
    // Continue anyway - document will be created on first save or work in localStorage mode
  }

  return { id: documentId };
}

export async function createDocumentAndRedirect() {
  const result = await createDocument();
  redirect(`/editor/${result.id}`);
}

export async function saveDocument({
  documentId,
  title,
  content,
}: {
  documentId: string;
  title: string;
  content: string;
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    // Check if document exists
    const existingDocs = await getDocumentsById({ id: documentId });

    if (existingDocs.length > 0) {
      // Update existing document
      await updateEditorDocument({
        id: documentId,
        title,
        content,
      });
    } else {
      // Create new document
      await saveEditorDocument({
        id: documentId,
        title,
        content,
        userId: session.user.id,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save document:', error);

    // Check if it's a foreign key constraint violation (user doesn't exist)
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      console.warn(
        'User not found in database, likely a stale session. Document saved to localStorage instead.',
      );
      // Return success to allow localStorage mode to work
      return { success: true, mode: 'localStorage' };
    }

    throw new Error('Failed to save document');
  }
}

export async function deleteDocument({ documentId }: { documentId: string }) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    await deleteEditorDocumentById({ id: documentId });
    revalidatePath('/editor');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw new Error('Failed to delete document');
  }
}

export async function duplicateDocument({ documentId }: { documentId: string }) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    // Get the original document
    const existingDocs = await getDocumentsById({ id: documentId });
    if (existingDocs.length === 0) {
      throw new Error('Document not found');
    }

    const originalDoc = existingDocs[0];
    const newDocumentId = generateUUID();

    // Create duplicate with new ID and updated title
    await saveEditorDocument({
      id: newDocumentId,
      title: `${originalDoc.title} (Copy)`,
      content: typeof originalDoc.content === 'string' ? originalDoc.content : '',
      userId: session.user.id,
    });

    revalidatePath('/editor');
    return { success: true, documentId: newDocumentId };
  } catch (error) {
    console.error('Failed to duplicate document:', error);
    throw new Error('Failed to duplicate document');
  }
}
