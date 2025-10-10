'use client';

import { deleteDocument, duplicateDocument } from '@/app/(main)/editor/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Document } from '@/lib/db/schema';
import { formatDistanceToNow } from 'date-fns';
import { Code, Copy, FileText, Image, Plus, Search, Table, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface DocumentListProps {
  documents: Document[];
  onDocumentDeleted?: (documentId: string) => void;
  onDocumentDuplicated?: () => void;
}

const DocumentIcon = ({ kind }: { kind?: string }) => {
  switch (kind) {
    case 'code':
      return <Code className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'sheet':
      return <Table className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export function DocumentList({
  documents,
  onDocumentDeleted,
  onDocumentDuplicated,
}: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingId(documentId);
    try {
      await deleteDocument({ documentId });
      toast.success('Document deleted');
      onDocumentDeleted?.(documentId);
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (documentId: string) => {
    setDuplicatingId(documentId);
    try {
      await duplicateDocument({ documentId });
      toast.success('Document duplicated');
      onDocumentDuplicated?.();
    } catch (error) {
      toast.error('Failed to duplicate document');
      console.error('Duplicate error:', error);
    } finally {
      setDuplicatingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium text-muted-foreground">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first document to get started'}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link href="/editor/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map(document => (
            <Card key={document.id} className="p-4 transition-shadow hover:shadow-md">
              <div className="space-y-3">
                {/* Document Header */}
                <div className="flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <DocumentIcon kind={undefined} />
                    <Link
                      href={`/editor/${document.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {document.title}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(document.id)}
                      disabled={duplicatingId === document.id}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      title="Duplicate document"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      disabled={deletingId === document.id}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {/* <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                      {String(document.visibility)}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{String(document.kind)}</span>
                    <span>•</span> */}
                    <span>{formatDate(document.createdAt)}</span>
                  </div>

                  {document.content && typeof document.content === 'string' ? (
                    <p className="line-clamp-2 overflow-hidden text-sm text-muted-foreground">
                      {String(document.content).slice(0, 100)}...
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
