import { redirect } from 'next/navigation';

import { DocumentDashboard } from '@/components/document-dashboard';
import { getDocumentsByUserId } from '@/lib/db/queries';
import { auth } from '../../(auth)/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  // Fetch user's documents
  let documents: Awaited<ReturnType<typeof getDocumentsByUserId>> = [];
  try {
    documents = await getDocumentsByUserId({ userId: session.user.id });
  } catch (error) {
    console.error('Failed to load documents:', error);
  }

  return <DocumentDashboard documents={documents} />;
}
