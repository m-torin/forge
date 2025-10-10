'use client';

import { ChatHeader } from '@/components/chat-header';
import { AppMainContent } from '@/components/layouts/app-layout';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import type { ChatModelId } from '@/lib/ai/models';
import type { Vote } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { transportFactory, useChat } from '@repo/ai/ui/react';
import type { DefaultChatTransport, LanguageModelUsage } from 'ai';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';
import { Artifact } from './artifact';
import { useDataStream } from './data-stream-provider';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { VisibilityType } from './visibility-selector';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: ChatModelId;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const [usage, setUsage] = useState<LanguageModelUsage | undefined>(undefined);

  const latestRequestContext = useRef({
    model: initialChatModel,
    visibility: visibilityType,
  });

  useEffect(() => {
    latestRequestContext.current = {
      model: initialChatModel,
      visibility: visibilityType,
    };
  }, [initialChatModel, visibilityType]);

  const userId = session?.user?.id;

  const transport = useMemo<DefaultChatTransport<ChatMessage>>(() => {
    const base = transportFactory.create({
      api: '/api/chat',
      userId,
      conversationId: id,
      enableTelemetry: true,
    });

    const transportWithOverrides = base as unknown as {
      fetch: typeof fetchWithErrorHandlers;
      prepareSendMessagesRequest: ({
        messages,
        id,
        body,
      }: {
        messages: ChatMessage[];
        id: string;
        body: Record<string, unknown>;
      }) => { body: Record<string, unknown> };
    };

    transportWithOverrides.fetch = fetchWithErrorHandlers;
    transportWithOverrides.prepareSendMessagesRequest = ({ messages, id, body }) => {
      const { model, visibility } = latestRequestContext.current;
      return {
        body: {
          ...body,
          id,
          message: messages.at(-1),
          selectedChatModel: model,
          selectedVisibilityType: visibility,
        },
      };
    };

    return base as DefaultChatTransport<ChatMessage>;
  }, [id, userId]);

  const { messages, setMessages, sendMessage, status, stop, regenerate, resumeStream } =
    useChat<ChatMessage>({
      id,
      messages: initialMessages,
      experimental_throttle: 100,
      generateId: generateUUID,
      transport,
      onData: dataPart => {
        setDataStream(ds => (ds ? [...ds, dataPart] : []));
        if (dataPart.type === 'data-usage') {
          setUsage(dataPart.data);
        }
      },
      onFinish: () => {
        mutate(unstable_serialize(getChatHistoryPaginationKey));
      },
      onError: error => {
        if (error instanceof ChatSDKError) {
          toast({
            type: 'error',
            description: error.message,
          });
        }
      },
    });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <ChatHeader
        chatId={id}
        selectedVisibilityType={initialVisibilityType}
        isReadonly={isReadonly}
      />

      <AppMainContent variant="chat">
        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          selectedModelId={initialChatModel}
        />

        <div className="sticky bottom-0 z-[1] mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              sendMessage={sendMessage}
              selectedVisibilityType={visibilityType}
              selectedModelId={initialChatModel}
              usage={usage}
            />
          )}
        </div>
      </AppMainContent>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={initialChatModel}
      />
    </>
  );
}
