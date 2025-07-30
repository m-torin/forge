'use client';

import { logInfo } from '@repo/observability';
import { useCallback, useEffect, useState } from 'react';
import { CollaborationOptions } from '../types/index';
import { useCollaboration } from './use-collaboration';

interface CollaborativeEditingOptions extends CollaborationOptions {
  onContentChange?: (content: string) => void;
  conflictResolution?: 'last-write-wins' | 'operational-transform';
}

export function useCollaborativeEditing(options: CollaborativeEditingOptions) {
  const [documentVersion, setDocumentVersion] = useState(0);
  const [pendingOperations, _setPendingOperations] = useState<any[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const collaboration = useCollaboration(options);

  const applyOperation = useCallback(
    (operation: any) => {
      // In a real implementation, this would apply operational transformations
      // For now, we'll use a simple last-write-wins approach
      if (options.conflictResolution === 'operational-transform') {
        // Transform operation based on document state and pending operations
        // This is a complex topic that would require a proper OT implementation
        logInfo('Applying operation with OT:', operation);
      } else {
        // Simple last-write-wins
        if (options.onContentChange && operation.data.content) {
          options.onContentChange(operation.data.content);
        }
      }
      setDocumentVersion(prev => prev + 1);
    },
    [options],
  );

  const sendEdit = useCallback(
    (content: string, operation?: any) => {
      const editEvent = {
        type: 'edit' as const,
        userId: options.userId,
        data: {
          content,
          operation: operation || { type: 'replace', content },
          version: documentVersion,
        },
      };

      collaboration.sendEvent(editEvent);

      if (options.autoSave) {
        setIsAutoSaving(true);
        // Simulate auto-save delay
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    },
    [collaboration, options, documentVersion],
  );

  const handleRemoteEdit = useCallback(
    (event: any) => {
      if (event.type === 'edit' && event.userId !== options.userId) {
        applyOperation(event);
      }
    },
    [applyOperation, options.userId],
  );

  useEffect(() => {
    // In a real implementation, you would listen for remote edit events
    // and apply them using operational transformation
  }, [handleRemoteEdit]);

  return {
    ...collaboration,
    documentVersion,
    pendingOperations,
    isAutoSaving,
    sendEdit,
    applyOperation,
  };
}
