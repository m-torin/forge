'use client';

import { DocumentList } from '@/components/document-list';
import { AppHeader } from '@/components/layouts/app-header';
import { AppMainContent } from '@/components/layouts/app-layout';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import type { Document } from '@/lib/db/schema';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

interface DocumentDashboardProps {
  documents: Document[];
}

export function DocumentDashboard({ documents: initialDocuments }: DocumentDashboardProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleDocumentDeleted = (documentId: string) => {
    // Optimistically remove the document from the list
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
  };

  const handleDocumentDuplicated = () => {
    // Refresh the page to show the duplicated document
    startTransition(() => {
      router.refresh();
    });
  };

  const handleNewDocument = () => {
    router.push('/editor/new');
  };

  return (
    <>
      <AppHeader
        variant="editor"
        leftSlot={
          <>
            <SidebarToggle />
            <h1 className="text-lg font-semibold">Documents</h1>
          </>
        }
        rightSlot={
          <Button onClick={handleNewDocument} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        }
      />

      <AppMainContent variant="editor">
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground">Create and manage your documents</p>
          </div>

          <DocumentList
            documents={documents}
            onDocumentDeleted={handleDocumentDeleted}
            onDocumentDuplicated={handleDocumentDuplicated}
          />
        </div>
      </AppMainContent>
    </>
  );
}
