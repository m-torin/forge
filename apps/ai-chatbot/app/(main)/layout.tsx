import { cookies } from 'next/headers';

import { getDocumentsByUserId } from '@/lib/db/queries';
import Script from 'next/script';
import { auth } from '../(auth)/auth';
import { MainLayoutClient } from './layout-client';

export const experimental_ppr = true;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // Fetch user's documents for the sidebar (we'll determine usage client-side)
  let documents: Awaited<ReturnType<typeof getDocumentsByUserId>> = [];
  if (session?.user?.id) {
    try {
      documents = await getDocumentsByUserId({ userId: session.user.id, limit: 10 });
    } catch (error) {
      console.error('Failed to load documents for sidebar:', error);
      // Continue without documents to prevent app crash
      documents = [];
    }
  }

  return (
    <>
      {/* Include Pyodide script for chat functionality */}
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />

      {/* Client component handles route detection and conditional providers */}
      <MainLayoutClient
        user={session?.user}
        documents={documents}
        defaultSidebarOpen={!isCollapsed}
      >
        {children}
      </MainLayoutClient>
    </>
  );
}
