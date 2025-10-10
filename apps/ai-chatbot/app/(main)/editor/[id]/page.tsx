import { redirect } from 'next/navigation';

import { DocumentEditor } from '@/components/editor/document-editor';
import { getDocumentsById } from '@/lib/db/queries';
import { auth } from '../../../(auth)/auth';

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;
  const { mode } = searchParams;

  // Check if we're in localStorage mode
  const isLocalStorageMode =
    process.env.NODE_ENV === 'development' && (id.startsWith('temp-') || mode === 'localStorage');

  const session = await auth();

  if (!session && !isLocalStorageMode) {
    redirect('/api/auth/guest');
  }

  // Load document from database if it exists and not in localStorage mode
  let initialTitle = 'Untitled Document';
  let initialContent = '';
  let documentMetadata = null;

  if (!isLocalStorageMode) {
    try {
      const existingDocs = await getDocumentsById({ id });
      if (existingDocs.length > 0) {
        const document = existingDocs[0];
        initialTitle = document.title;
        initialContent = typeof document.content === 'string' ? document.content : '';
        documentMetadata = {
          createdAt: document.createdAt,
          // updatedAt: document.updatedAt,
          // kind: document.kind,
          // visibility: document.visibility,
        };
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      // Continue with empty document
    }
  }

  return (
    <DocumentEditor
      documentId={id}
      userId={session?.user?.id || 'localStorage-user'}
      initialTitle={initialTitle}
      initialContent={initialContent}
      documentMetadata={documentMetadata}
    />
  );
}
