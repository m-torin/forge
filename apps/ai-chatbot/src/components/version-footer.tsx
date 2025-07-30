'use client';

import { SPRING, Z_INDEX } from '#/lib/ui-constants';
import { useViewportSize } from '@mantine/hooks';
import { isAfter } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

import type { Document } from '#/lib/db/schema';
import { getDocumentTimestampByIndex } from '#/lib/utils';

import { LoaderIcon } from '#/components/icons';
import { Button } from '#/components/ui/button';
import { useArtifact } from '#/hooks/use-artifact';

/**
 * Props for VersionFooter component
 */
interface VersionFooterProps {
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  documents: Array<Document> | undefined;
  currentVersionIndex: number;
}

/**
 * Version footer component for document version control
 * @param handleVersionChange - Function to handle version changes
 * @param documents - Array of document versions
 * @param currentVersionIndex - Index of current version
 */
export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
}: VersionFooterProps) => {
  const { artifact } = useArtifact();

  const { width } = useViewportSize();
  const isMobile = width < 768;

  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

  if (!documents) return;

  return (
    <motion.div
      className={`absolute bottom-0 z-[${Z_INDEX.PANEL}] flex w-full flex-col justify-between gap-4 border-t bg-background p-4 lg:flex-row`}
      initial={{ y: isMobile ? 200 : 77 }}
      animate={{ y: 0 }}
      exit={{ y: isMobile ? 200 : 77 }}
      transition={SPRING.GENTLE}
    >
      <div>
        <div>You are viewing a previous version</div>
        <div className="text-sm text-muted-foreground">Restore this version to make edits</div>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          disabled={isMutating}
          onClick={async () => {
            setIsMutating(true);

            mutate(
              `/api/document?id=${artifact.documentId}`,
              await fetch(
                `/api/document?id=${artifact.documentId}&timestamp=${getDocumentTimestampByIndex(
                  documents,
                  currentVersionIndex,
                )}`,
                {
                  method: 'DELETE',
                },
              ),
              {
                optimisticData: documents
                  ? [
                      ...documents.filter(document =>
                        isAfter(
                          new Date(document.createdAt),
                          new Date(getDocumentTimestampByIndex(documents, currentVersionIndex)),
                        ),
                      ),
                    ]
                  : [],
              },
            );
          }}
        >
          <div>Restore this version</div>
          {isMutating && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleVersionChange('latest');
          }}
        >
          Back to latest version
        </Button>
      </div>
    </motion.div>
  );
};
