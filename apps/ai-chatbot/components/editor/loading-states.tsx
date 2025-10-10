'use client';

import { Skeleton } from '@/components/ui/skeleton';

const DOCUMENT_SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `document-skeleton-${index}`,
);
const SIDEBAR_SKELETON_KEYS = Array.from({ length: 3 }, (_, index) => `sidebar-skeleton-${index}`);

export function DocumentListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DOCUMENT_SKELETON_KEYS.map(key => (
          <div key={key} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocumentEditorSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex flex-1 items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 p-4">
        <div className="mx-auto h-full max-w-4xl space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarDocumentsSkeleton() {
  return (
    <div className="space-y-2 px-2 py-4">
      <Skeleton className="mb-2 h-4 w-32" />
      {SIDEBAR_SKELETON_KEYS.map(key => (
        <div key={key} className="space-y-1 p-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
    />
  );
}

export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
