'use client';
import { useDataStream } from '#/components/data-stream-provider';
import { DocumentToolCall, DocumentToolResult } from '#/components/document';
import { DocumentPreview } from '#/components/document-preview';
import { AiThinkingIndicator, useAiThinking } from '#/components/features/ai-thinking-indicator';
import { PencilEditIcon, SparklesIcon } from '#/components/icons';
import { ImageDisplay } from '#/components/image-display';
import { Markdown } from '#/components/markdown';
import { MCPDisplay } from '#/components/mcp/mcp-display';
import { MessageActions } from '#/components/message-actions';
import { MessageEditor } from '#/components/message-editor';
import { MessageReasoning } from '#/components/message-reasoning';
import { PreviewAttachment } from '#/components/preview-attachment';
import { RAGToolCall, RAGToolResult } from '#/components/rag/rag-sources';
import { MessageConfidenceIndicator } from '#/components/response-confidence';
import { Sources } from '#/components/sources';
import { StructuredDataDisplay } from '#/components/structured-data-display';
import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { Weather, type WeatherAtLocation } from '#/components/weather';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import type { Vote } from '#/lib/db/schema';
import type { ChatMessage } from '#/lib/types';
import { cn, sanitizeText } from '#/lib/utils';
import type { UseChatHelpers } from '@ai-sdk/react';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';

// Type narrowing is handled by TypeScript's control flow analysis
// The AI SDK provides proper discriminated unions for tool calls

/**
 * Pure message preview component for rendering individual chat messages
 * @param chatId - Chat identifier
 * @param message - Message data to render
 * @param vote - User vote on this message
 * @param isLoading - Whether message is currently loading
 * @param setMessages - Function to update message array
 * @param reload - Function to reload conversation
 * @param isReadonly - Whether message is in read-only mode
 * @param requiresScrollPadding - Whether to add scroll padding
 */
const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<any, any>['setMessages'];
  reload: () => Promise<string | null | undefined>;
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Enhanced animation system for message performance optimization
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Performance monitoring and cleanup for individual messages
  useEffect(() => {
    performance.startMonitoring();
    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [performance, cleanup]);

  // Memoize attachment filtering to prevent recalculation on every render
  const attachmentsFromMessage = useMemo(
    () => message.parts.filter(part => part.type === 'file'),
    [message.parts],
  );

  useDataStream();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message mx-auto w-full max-w-3xl px-4"
        variants={variants.messageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        data-role={message.role}
        style={{
          willChange: 'transform, opacity',
        }}
      >
        <div
          className={cn(
            'flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <motion.div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border"
              variants={variants.scaleVariants}
              initial="hidden"
              animate="visible"
              style={{
                willChange: 'transform',
              }}
            >
              <motion.div
                className="translate-y-px"
                animate={{
                  rotate: isLoading ? [0, 2, -2, 0] : 0,
                  scale: isLoading ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: isLoading ? 2 : 0.3,
                  repeat: isLoading ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <SparklesIcon size={14} />
              </motion.div>
            </motion.div>
          )}

          <div
            className={cn('flex w-full flex-col gap-4', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            <AnimatePresence>
              {attachmentsFromMessage.length > 0 && (
                <motion.div
                  data-testid="message-attachments"
                  className="flex flex-row justify-end gap-2"
                  variants={variants.staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {attachmentsFromMessage.map((attachment, index) => (
                    <motion.div
                      key={attachment.url}
                      variants={variants.slideUpVariants}
                      transition={{ delay: performance.optimizedDuration(index * 0.05) }}
                      style={{
                        willChange: 'transform, opacity',
                      }}
                    >
                      <PreviewAttachment
                        attachment={{
                          name: attachment.filename ?? 'file',
                          contentType: attachment.mediaType,
                          url: attachment.url,
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning' && part.text?.trim().length > 0) {
                return <MessageReasoning key={key} isLoading={isLoading} reasoning={part.text} />;
              }

              // Skip individual source parts - they'll be aggregated below
              if (type === 'source') {
                return null;
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={variants.hoverVariants.hover}
                              whileTap={variants.hoverVariants.tap}
                            >
                              <motion.div
                                animate={{
                                  opacity: 0,
                                  transition: { duration: performance.optimizedDuration(0.2) },
                                }}
                                whileHover={{
                                  opacity: 1,
                                  transition: { duration: performance.optimizedDuration(0.15) },
                                }}
                                style={{ willChange: 'opacity' }}
                              >
                                <Button
                                  data-testid="message-edit-button"
                                  variant="ghost"
                                  className="group h-fit rounded-full px-2 text-muted-foreground"
                                  onClick={() => {
                                    performance.batchUpdates([() => setMode('edit')]);
                                  }}
                                >
                                  <motion.div
                                    whileHover={{
                                      scale: 1.1,
                                      rotate: 5,
                                      transition: { duration: performance.optimizedDuration(0.2) },
                                    }}
                                    whileTap={{
                                      scale: 0.95,
                                      transition: { duration: performance.optimizedDuration(0.1) },
                                    }}
                                    style={{ willChange: 'transform' }}
                                  >
                                    <PencilEditIcon />
                                  </motion.div>
                                </Button>
                              </motion.div>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <motion.div
                        data-testid="message-content"
                        className={cn('relative flex flex-col gap-4', {
                          'rounded-xl bg-primary px-3 py-2 text-primary-foreground':
                            message.role === 'user',
                        })}
                        variants={variants.slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        layout
                        style={{
                          willChange: 'transform, opacity',
                        }}
                      >
                        <motion.div
                          variants={variants.fadeVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: performance.optimizedDuration(0.1) }}
                        >
                          <Markdown>{sanitizeText(part.text)}</Markdown>
                        </motion.div>

                        {/* Confidence Indicator for AI responses */}
                        <AnimatePresence>
                          {message.role === 'assistant' && (
                            <motion.div
                              variants={variants.slideUpVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="mt-2"
                              transition={{ delay: performance.optimizedDuration(0.2) }}
                            >
                              <MessageConfidenceIndicator message={part.text} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part as any;
                const { toolName, toolCallId, state } = toolInvocation;

                // Weather tool with enhanced animations
                if (toolName === 'getWeather') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <motion.div
                        key={toolCallId}
                        className="skeleton"
                        variants={variants.slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ willChange: 'opacity' }}
                      >
                        <Weather />
                      </motion.div>
                    );
                  }

                  if (state === 'result') {
                    return (
                      <motion.div
                        key={toolCallId}
                        variants={variants.slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                          type: 'spring',
                          stiffness: performance.isHighPerformanceDevice ? 300 : 250,
                          damping: 25,
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <Weather weatherAtLocation={toolInvocation.result as WeatherAtLocation} />
                      </motion.div>
                    );
                  }
                }

                // Create Document tool with enhanced animations
                if (toolName === 'createDocument') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <motion.div
                        key={toolCallId}
                        variants={variants.slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <DocumentPreview isReadonly={isReadonly} args={toolInvocation.args} />
                      </motion.div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <motion.div
                          key={toolCallId}
                          className="rounded border p-2 text-red-500"
                          variants={variants.shakeVariants}
                          initial="hidden"
                          animate="shake"
                          style={{ willChange: 'transform' }}
                        >
                          Error: {String((output as any).error)}
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={toolCallId}
                        variants={variants.slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{
                          type: 'spring',
                          stiffness: performance.isHighPerformanceDevice ? 350 : 280,
                          damping: 20,
                        }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <DocumentPreview isReadonly={isReadonly} result={output} />
                      </motion.div>
                    );
                  }
                }

                // Update Document tool
                if (toolName === 'updateDocument') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div key={toolCallId}>
                        <DocumentToolCall
                          type="update"
                          args={toolInvocation.args}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    return (
                      <div key={toolCallId}>
                        <DocumentToolResult type="update" result={output} isReadonly={isReadonly} />
                      </div>
                    );
                  }
                }

                // Request Suggestions tool
                if (toolName === 'requestSuggestions') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div key={toolCallId}>
                        <DocumentToolCall
                          type="request-suggestions"
                          args={toolInvocation.args}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    return (
                      <div key={toolCallId}>
                        <DocumentToolResult
                          type="request-suggestions"
                          result={output}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }
                }

                // RAG Tools
                if (toolName === 'addResource') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div key={toolCallId}>
                        <RAGToolCall
                          type="addResource"
                          args={toolInvocation.args}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    return (
                      <div key={toolCallId}>
                        <RAGToolResult type="addResource" result={output} isReadonly={isReadonly} />
                      </div>
                    );
                  }
                }

                if (toolName === 'getInformation') {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div key={toolCallId}>
                        <RAGToolCall
                          type="getInformation"
                          args={toolInvocation.args}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    return (
                      <div key={toolCallId}>
                        <RAGToolResult
                          type="getInformation"
                          result={output}
                          isReadonly={isReadonly}
                        />
                      </div>
                    );
                  }
                }

                // Structured Data Tools
                if (
                  toolName.includes('structureMeetingNotes') ||
                  toolName.includes('generateTaskList') ||
                  toolName.includes('extractKeyInfo') ||
                  toolName.includes('extractContactInfo') ||
                  toolName.includes('generateArticle') ||
                  toolName.includes('generateStructuredData')
                ) {
                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    let displayType = 'custom';
                    if (toolName.includes('structureMeetingNotes')) displayType = 'meeting-notes';
                    else if (toolName.includes('generateTaskList')) displayType = 'task-list';
                    else if (toolName.includes('extractKeyInfo')) displayType = 'key-info';
                    else if (toolName.includes('extractContactInfo')) displayType = 'contact-info';
                    else if (toolName.includes('generateArticle')) displayType = 'article';

                    return (
                      <div key={toolCallId}>
                        <StructuredDataDisplay
                          type={displayType as any}
                          data={
                            (output as any).structuredNotes ||
                            (output as any).taskList ||
                            (output as any).keyInfo ||
                            (output as any).contactInfo ||
                            (output as any).article ||
                            (output as any).structuredData
                          }
                        />
                      </div>
                    );
                  }
                }

                // Image Generation Tools
                if (
                  toolName.includes('generateImage') ||
                  toolName.includes('generateDiagram') ||
                  toolName.includes('generateIllustration') ||
                  toolName.includes('createImageVariation')
                ) {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div
                        key={toolCallId}
                        className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                      >
                        <p className="text-sm font-medium">Generating image...</p>
                        <p className="text-xs text-muted-foreground">
                          {(toolInvocation.args as any)?.prompt ||
                            (toolInvocation.args as any)?.description ||
                            'Processing...'}
                        </p>
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    let displayType = 'single';
                    if (toolName.includes('generateDiagram')) displayType = 'diagram';
                    else if (toolName.includes('generateIllustration'))
                      displayType = 'illustration';
                    else if (toolName.includes('createImageVariation')) displayType = 'variation';

                    return (
                      <div key={toolCallId}>
                        <ImageDisplay type={displayType as any} data={output} />
                      </div>
                    );
                  }
                }

                // MCP Tools
                if (
                  toolName.includes('enhancedWebSearch') ||
                  toolName.includes('codeInterpreter') ||
                  toolName.includes('fileOperations') ||
                  toolName.includes('connectionStatus')
                ) {
                  if (state === 'call' || state === 'partial-call') {
                    return (
                      <div
                        key={toolCallId}
                        className="rounded-lg border border-purple-200 bg-purple-50 p-3"
                      >
                        <p className="text-sm font-medium">Executing MCP tool...</p>
                        <p className="text-xs text-muted-foreground">
                          {(toolInvocation.args as any)?.query ||
                            (toolInvocation.args as any)?.command ||
                            (toolInvocation.args as any)?.operation ||
                            'Processing request'}
                        </p>
                      </div>
                    );
                  }

                  if (state === 'result') {
                    const output = toolInvocation.result;

                    if (output && typeof output === 'object' && 'error' in output) {
                      return (
                        <div key={toolCallId} className="rounded border p-2 text-red-500">
                          Error: {String((output as any).error)}
                        </div>
                      );
                    }

                    let displayType = 'generic';
                    if (toolName.includes('enhancedWebSearch')) displayType = 'web-search';
                    else if (toolName.includes('codeInterpreter')) displayType = 'code-interpreter';
                    else if (toolName.includes('fileOperations')) displayType = 'file-operations';
                    else if (toolName.includes('connectionStatus'))
                      displayType = 'connection-status';

                    return (
                      <div key={toolCallId}>
                        <MCPDisplay type={displayType as any} data={output} />
                      </div>
                    );
                  }
                }
              }
            })}

            {/* Aggregate and display sources */}
            {(() => {
              const sources = message.parts
                ?.filter(part => part.type === 'source')
                .map(part => part as any);

              if (sources && sources.length > 0) {
                return <Sources sources={sources} className="mb-4" />;
              }
              return null;
            })()}

            <AnimatePresence>
              {!isReadonly && (
                <motion.div
                  key={`action-${message.id}`}
                  variants={variants.slideUpVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: performance.optimizedDuration(0.3) }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <MessageActions
                    chatId={chatId}
                    message={message}
                    vote={vote}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(PurePreviewMessage, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.message.id !== nextProps.message.id) return false;
  if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
  if (!equal(prevProps.vote, nextProps.vote)) return false;

  return true; // Return true to prevent re-render when props are equal
});

export const ThinkingMessage = () => {
  const role = 'assistant';
  const { stage, isActive: _isActive, startThinking } = useAiThinking();

  // Enhanced animation system for thinking message
  const { variants, performance, cleanup } = useAnimationSystem({
    enableHardwareAccel: true,
    respectReducedMotion: true,
  });

  // Start thinking animation when component mounts
  useEffect(() => {
    startThinking('understanding');
    performance.startMonitoring();

    return () => {
      performance.stopMonitoring();
      cleanup();
    };
  }, [startThinking, performance, cleanup]);

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="group/message mx-auto w-full max-w-3xl px-4"
      variants={variants.slideUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      data-role={role}
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="flex w-full gap-4">
        <motion.div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border"
          variants={variants.scaleVariants}
          initial="hidden"
          animate="visible"
          style={{ willChange: 'transform' }}
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: performance.optimizedDuration(2),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <SparklesIcon size={14} />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex w-full flex-col gap-3"
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* AI Thinking Indicator */}
          <motion.div
            variants={variants.slideRightVariants}
            style={{ willChange: 'transform, opacity' }}
          >
            <AiThinkingIndicator stage={stage} isActive={true} size="md" showLabel={true} />
          </motion.div>

          {/* Enhanced thinking dots with performance optimization */}
          <motion.div
            className="flex items-center gap-1 text-sm text-muted-foreground"
            variants={variants.slideRightVariants}
          >
            <motion.span variants={variants.fadeVariants} initial="hidden" animate="visible">
              Processing your request
            </motion.span>
            <motion.div
              className="flex items-center"
              variants={variants.staggerContainerFast}
              initial="hidden"
              animate="visible"
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  variants={variants.thinkingDotsVariants}
                  animate="thinking"
                  transition={{
                    delay: performance.optimizedDuration(i * 0.1),
                    duration: performance.optimizedDuration(1),
                  }}
                >
                  .
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
