'use client';

import { DataStreamProvider } from '@/components/data-stream-provider';
import { EditorErrorBoundary } from '@/components/editor/error-boundary';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedSidebar } from '@/components/layouts/unified-sidebar';
import type { Document } from '@/lib/db/schema';
import type { User } from 'next-auth';
import { usePathname } from 'next/navigation';

interface MainLayoutClientProps {
  user?: User;
  documents: Document[];
  defaultSidebarOpen: boolean;
  children: React.ReactNode;
}

export function MainLayoutClient({
  user,
  documents,
  defaultSidebarOpen,
  children,
}: MainLayoutClientProps) {
  const pathname = usePathname();

  // Determine the current route to set the appropriate variant
  const isEditorRoute = pathname.startsWith('/editor');
  const variant = isEditorRoute ? 'editor' : 'chat';
  const mode = isEditorRoute ? 'editor' : 'chat';

  const layout = (
    <AppLayout
      variant={variant}
      defaultSidebarOpen={defaultSidebarOpen}
      sidebar={
        <UnifiedSidebar user={user} mode={mode} documents={isEditorRoute ? documents : []} />
      }
    >
      {children}
    </AppLayout>
  );

  // Conditionally wrap with providers based on route
  if (isEditorRoute) {
    return <EditorErrorBoundary>{layout}</EditorErrorBoundary>;
  }

  return <DataStreamProvider>{layout}</DataStreamProvider>;
}
