'use client';

import { Artifact } from '#/components/artifact';
import { ChatHeader } from '#/components/chat-header';
import { useDataStream } from '#/components/data-stream-provider';
import { FeatureTooltip } from '#/components/features/feature-tooltip';
import { Messages } from '#/components/messages-with-virtual-scroll';
import { MultimodalInput } from '#/components/multimodal-input';
import { getChatHistoryPaginationKey } from '#/components/sidebar-history';
import { toast } from '#/components/toast';
import type { VisibilityType } from '#/components/visibility-selector';
import { useChatVisibility } from '#/hooks/chat/use-chat-visibility';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { useArtifactSelector } from '#/hooks/use-artifact';
import { useAutoResume } from '#/hooks/use-auto-resume';
import { useMockChatReplace } from '#/hooks/use-mock-chat';
import type { Vote } from '#/lib/db/schema';
import { ChatSDKError } from '#/lib/errors';
import { mockDataStore } from '#/lib/mock-data';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { Attachment, ChatMessage, CustomUIDataTypes, MessageMetadata } from '#/lib/types';
import { RESPONSIVE } from '#/lib/ui-constants';
import { fetcher, generateUUID } from '#/lib/utils';
import { useChat } from '@ai-sdk/react';
import { logInfo } from '@repo/observability';
import { motion } from 'framer-motion';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';

// Remove local type alias to avoid conflicts

/**
 * Main chat component handling AI conversations with streaming responses
 * @param id - Unique chat identifier
 * @param initialMessages - Initial message history
 * @param initialChatModel - Selected AI model
 * @param initialVisibilityType - Chat visibility setting
 * @param isReadonly - Whether chat is in read-only mode
 * @param session - User session data
 * @param autoResume - Whether to auto-resume interrupted conversations
 */
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
  initialChatModel: string;
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
  const { setDataStream: _setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(initialChatModel);

  // Initialize animation system for chat performance optimization
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Start performance monitoring for chat animations
  useEffect(() => {
    performance.startMonitoring();
    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [performance, cleanup]);

  // Use mock chat in prototype mode, real chat otherwise
  const prototypeMode = useMemo(() => isPrototypeMode(), []);

  // Memoize callback functions to prevent unnecessary re-renders
  const onFinish = useCallback(() => {
    mutate(unstable_serialize(getChatHistoryPaginationKey));
  }, [mutate]);

  const onError = useCallback((error: Error) => {
    if (ChatSDKError.isInstance(error)) {
      toast({
        type: 'error',
        description: error.message,
      });
    }
  }, []);

  const realChatHelpers = useChat<MessageMetadata, CustomUIDataTypes>({
    id,
    onFinish,
    onError,
  });

  // Memoize mock callbacks to prevent recreation
  const mockOnFinish = useCallback(() => {
    // Mock the mutate call for prototype mode
    logInfo('Mock: Chat finished');
  }, []);

  const mockChatHelpers = useMockChatReplace({
    id,
    initialMessages: initialMessages,
    generateId: generateUUID,
    onFinish: mockOnFinish,
    onError,
  });

  // Select the appropriate chat helpers based on mode
  const chatHelpers = prototypeMode ? mockChatHelpers : realChatHelpers;
  const { messages, setMessages, append, status, stop, reload: rawReload } = chatHelpers;

  // Create a wrapper for reload to match component expectations
  const reload = useCallback(async () => {
    return await rawReload();
  }, [rawReload]);

  // Set initial messages for real chat if they don't exist
  useEffect(() => {
    if (!prototypeMode && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages, messages.length, prototypeMode]);

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    prototypeMode ? null : messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  // Use mock votes in prototype mode
  const mockVotes = prototypeMode ? mockDataStore.getVotes() : undefined;
  const finalVotes = prototypeMode ? mockVotes : votes;

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector(state => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    setMessages,
  });

  return (
    <>
      <motion.div
        className="flex h-dvh min-w-0 flex-col bg-background"
        variants={variants.fadeVariants}
        initial="hidden"
        animate="visible"
        style={{
          willChange: 'transform, opacity',
        }}
      >
        <motion.div variants={variants.slideDownVariants} initial="hidden" animate="visible">
          <ChatHeader
            chatId={id}
            selectedModelId={selectedModel}
            selectedVisibilityType={initialVisibilityType}
            isReadonly={isReadonly}
            session={session}
            messages={messages}
            onModelSelect={setSelectedModel}
          />
        </motion.div>

        <FeatureTooltip
          featureId="virtual-scrolling"
          title="Virtual Scrolling"
          description="Efficiently handle thousands of messages with smooth scrolling performance"
          trigger="hover"
          position="right"
          className="flex w-full min-w-0 flex-1 flex-col"
        >
          <motion.div
            className="flex w-full min-w-0 flex-1 flex-col"
            variants={variants.slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Messages
              chatId={id}
              status={status}
              votes={finalVotes}
              messages={messages}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              isArtifactVisible={isArtifactVisible}
            />
          </motion.div>
        </FeatureTooltip>

        <motion.form
          className={`mx-auto flex w-full gap-2 bg-background ${RESPONSIVE.LAYOUT.CONTENT_MOBILE} pb-4 md:max-w-4xl md:pb-6`}
          variants={variants.slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          {!isReadonly && (
            <FeatureTooltip
              featureId="multimodal-input"
              title="Enhanced Input"
              description="Upload files, images, and use voice input with smart suggestions"
              trigger="hover"
              position="top"
              className="w-full lg:max-w-[70%]"
            >
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
                append={append}
                selectedVisibilityType={visibilityType}
              />
            </FeatureTooltip>
          )}
        </motion.form>
      </motion.div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={finalVotes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
