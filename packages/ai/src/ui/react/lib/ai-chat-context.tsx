/**
 * AiChat Context - Unified state management for AI Elements
 * Single context managing all AI chat functionality (branches, actions, conversation state)
 *
 * @example
 * ```tsx
 * <AiChatProvider onBranchChange={handleBranchChange}>
 *   <Conversation>
 *     <Branch>
 *       <BranchMessages>
 *         {messages.map(message => <Message key={message.id} {...message} />)}
 *       </BranchMessages>
 *     </Branch>
 *   </Conversation>
 * </AiChatProvider>
 * ```
 */

'use client';

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { createTimerManager, type TimerManager } from '../../utils';

/**
 * Message interface for branch management
 */
export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    duration?: number;
  };
}

/**
 * Message metadata for tracking additional information
 */
export interface MessageMetadata {
  tokens?: number;
  model?: string;
  duration?: number;
  timestamp?: Date;
  [key: string]: any;
}

/**
 * Streaming status for input components
 */
export type StreamingStatus = 'ready' | 'streaming' | 'loading';

/**
 * Main context state interface
 */
export interface AiChatState {
  // Branch management
  branches: AiChatMessage[][];
  currentBranch: number;
  totalBranches: number;

  // Actions state
  likedMessages: Set<string>;
  copiedMessages: Set<string>;

  // Conversation state
  isAtBottom: boolean;
  streamingStatus: StreamingStatus;

  // Message metadata
  messageMetadata: Map<string, MessageMetadata>;

  // Input state
  inputValue: string;
}

/**
 * Context actions interface
 */
export interface AiChatActions {
  // Branch actions
  setBranch: (index: number) => void;
  addBranch: (messages: AiChatMessage[]) => void;
  updateCurrentBranch: (messages: AiChatMessage[]) => void;

  // Message actions
  toggleLike: (messageId: string) => void;
  setCopied: (messageId: string) => void;
  setMessageMetadata: (messageId: string, metadata: MessageMetadata) => void;

  // Conversation actions
  setIsAtBottom: (isAtBottom: boolean) => void;
  scrollToBottom: () => void;

  // Streaming actions
  setStreamingStatus: (status: StreamingStatus) => void;

  // Input actions
  setInputValue: (value: string) => void;
}

/**
 * Combined context value
 */
export interface AiChatContextValue extends AiChatState, AiChatActions {
  // Callback props
  onBranchChange?: (branchIndex: number) => void;
  onMessageAction?: (action: string, messageId: string, data?: any) => void;
}

/**
 * Props for the AiChat provider
 */
export interface AiChatProviderProps {
  children: React.ReactNode;
  initialBranches?: AiChatMessage[][];
  initialBranch?: number;
  onBranchChange?: (branchIndex: number) => void;
  onMessageAction?: (action: string, messageId: string, data?: any) => void;
}

// Create the context
export const AiChatContext = createContext<AiChatContextValue | undefined>(undefined);

/**
 * AiChat Provider component
 */
export function AiChatProvider({
  children,
  initialBranches = [[]],
  initialBranch = 0,
  onBranchChange,
  onMessageAction,
}: AiChatProviderProps) {
  // Core state
  const [branches, setBranches] = useState<AiChatMessage[][]>(initialBranches);
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set());
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>('ready');
  const [messageMetadata, setMessageMetadata] = useState<Map<string, MessageMetadata>>(new Map());
  const [inputValue, setInputValue] = useState('');

  // Refs for scroll management and timer cleanup
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerManager = useRef<TimerManager>(createTimerManager());

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timerManager.current.clearAll();
    };
  }, []);

  // Derived state
  const totalBranches = branches.length;

  // Branch actions
  const setBranch = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalBranches) {
        setCurrentBranch(index);
        onBranchChange?.(index);
      }
    },
    [totalBranches, onBranchChange],
  );

  const addBranch = useCallback((messages: AiChatMessage[]) => {
    setBranches(prev => [...prev, messages]);
  }, []);

  const updateCurrentBranch = useCallback(
    (messages: AiChatMessage[]) => {
      setBranches(prev => {
        const updated = [...prev];
        updated[currentBranch] = messages;
        return updated;
      });
    },
    [currentBranch],
  );

  // Message actions
  const toggleLike = useCallback(
    (messageId: string) => {
      setLikedMessages(prev => {
        const updated = new Set(prev);
        if (updated.has(messageId)) {
          updated.delete(messageId);
        } else {
          updated.add(messageId);
        }
        return updated;
      });
      onMessageAction?.('like', messageId, { liked: !likedMessages.has(messageId) });
    },
    [likedMessages, onMessageAction],
  );

  const setCopied = useCallback(
    (messageId: string) => {
      setCopiedMessages(prev => new Set(prev).add(messageId));

      // Auto-clear copied status after 2 seconds using timer manager
      timerManager.current.setTimeout(() => {
        setCopiedMessages(prev => {
          const updated = new Set(prev);
          updated.delete(messageId);
          return updated;
        });
      }, 2000);

      onMessageAction?.('copy', messageId);
    },
    [onMessageAction],
  );

  const setMessageMetadataAction = useCallback((messageId: string, metadata: MessageMetadata) => {
    setMessageMetadata(prev => new Map(prev).set(messageId, metadata));
  }, []);

  // Conversation actions
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // Context value
  const contextValue: AiChatContextValue = {
    // State
    branches,
    currentBranch,
    totalBranches,
    likedMessages,
    copiedMessages,
    isAtBottom,
    streamingStatus,
    messageMetadata,
    inputValue,

    // Actions
    setBranch,
    addBranch,
    updateCurrentBranch,
    toggleLike,
    setCopied,
    setMessageMetadata: setMessageMetadataAction,
    setIsAtBottom,
    scrollToBottom,
    setStreamingStatus,
    setInputValue,

    // Callbacks
    onBranchChange,
    onMessageAction,
  };

  return <AiChatContext.Provider value={contextValue}>{children}</AiChatContext.Provider>;
}
