'use client';

import { useDataStream } from '@/components/data-stream-provider';
import type { ChatMessage } from '@/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: ChatMessage[];
  resumeStream: UseChatHelpers<ChatMessage>['resumeStream'];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  resumeStream,
  setMessages,
}: UseAutoResumeParams) {
  const { dataStream } = useDataStream();
  const hasResumedRef = useRef(false);

  useEffect(() => {
    if (hasResumedRef.current) return;
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === 'user') {
      resumeStream();
      hasResumedRef.current = true;
    }
  }, [autoResume, initialMessages, resumeStream]);

  useEffect(() => {
    if (!dataStream) return;
    if (dataStream.length === 0) return;

    const dataPart = dataStream[0];

    if (dataPart.type === 'data-appendMessage') {
      const message = JSON.parse(dataPart.data);
      setMessages([...initialMessages, message]);
    }
  }, [dataStream, initialMessages, setMessages]);
}
