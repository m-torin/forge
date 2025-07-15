'use client';

import { useDataStream } from '#/components/data-stream-provider';
import type { ChatMessage } from '#/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { logInfo } from '@repo/observability';
import { useCallback, useEffect, useMemo } from 'react';

/**
 * Parameters for auto-resume hook
 */
export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: ChatMessage[];
  setMessages: UseChatHelpers<
    import('#/lib/types').MessageMetadata,
    import('#/lib/types').CustomUIDataTypes
  >['setMessages'];
}

/**
 * Hook for automatically resuming interrupted chat conversations
 * @param autoResume - Whether auto-resume is enabled
 * @param initialMessages - Initial message history
 * @param setMessages - Function to update messages
 */
export function useAutoResume({ autoResume, initialMessages, setMessages }: UseAutoResumeParams) {
  const { dataStream } = useDataStream();

  // Use debounced value for messages to prevent rapid updates
  const [debouncedMessages] = useDebouncedValue(initialMessages, 100);

  // Memoize most recent message to prevent unnecessary re-evaluations
  const mostRecentMessage = useMemo(() => debouncedMessages.at(-1), [debouncedMessages]);

  useEffect(() => {
    if (!autoResume) return;

    if (mostRecentMessage?.role === 'user') {
      // AI SDK v5 handles resume automatically with `initialMessages`
      // No explicit resumeStream call needed
      logInfo('Auto-resume enabled for incomplete conversation');
    }
  }, [autoResume, mostRecentMessage]);

  // Use shallow effect for message handling optimization
  const handleDataStreamMessage = useCallback(
    (dataPart: any) => {
      if (dataPart.type === 'data-appendMessage') {
        const message = JSON.parse(dataPart.value);
        setMessages([...debouncedMessages, message]);
      }
    },
    [debouncedMessages, setMessages],
  );

  useShallowEffect(() => {
    if (!dataStream || dataStream.length === 0) return;

    const dataPart = dataStream[0];
    handleDataStreamMessage(dataPart);
  }, [{ dataStream, handleDataStreamMessage }]);
}
