import { auth, type UserType } from '#/app/(auth)/auth';
import type { VisibilityType } from '#/components/visibility-selector';
import { entitlementsByUserType } from '#/lib/ai/entitlements';
import { LifecycleAnalytics } from '#/lib/ai/lifecycle-monitoring';
import type { ChatModel } from '#/lib/ai/models';
import { systemPrompt, type RequestHints } from '#/lib/ai/prompts';
import { myProvider } from '#/lib/ai/providers';
import { createDocument } from '#/lib/ai/tools/document/create-document';
import { updateDocument } from '#/lib/ai/tools/document/update-document';
import {
  createBashTool,
  createComputerTool,
  createErrorRecovery,
  createStandardUIMessageStream,
  createTextEditorTool,
  defaultStreamTransform,
} from '@repo/ai/server';
// MCP tools now handled by feature flag system
import { generateTitleFromUserMessage } from '#/app/(chat)/actions';
import { postRequestBodySchema, type PostRequestBody } from '#/app/(chat)/api/chat/schema';
import { createChatbotRAGTools, isRAGEnabled } from '#/lib/ai/tools/rag/rag-tools';
import { getToolsForUserType } from '#/lib/ai/tools/utilities/enhanced-tools';
import { getWeather } from '#/lib/ai/tools/utilities/get-weather';
import { getImageGenerationTools } from '#/lib/ai/tools/utilities/image-generation-tools';
import { requestSuggestions } from '#/lib/ai/tools/utilities/request-suggestions';
import { getStructuredDataTools } from '#/lib/ai/tools/utilities/structured-data-tools';
import { isProductionEnvironment } from '#/lib/constants';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '#/lib/db/queries';
import { ChatSDKError } from '#/lib/errors';
import { context7Integration } from '#/lib/mcp/context7-integration';
import { createMcpToolsWithFeatureFlags } from '#/lib/mcp/feature-flags';
import { createMcpStreamLifecycleWrapper } from '#/lib/mcp/stream-lifecycle';
import type { ChatMessage } from '#/lib/types';
import { convertToUIMessages, generateUUID } from '#/lib/utils';
import { createTelemetryMiddleware } from '@repo/ai/server/next';
import { logError, logInfo } from '@repo/observability';
import { geolocation } from '@vercel/functions';
import {
  convertToModelMessages,
  JsonToSseTransformStream,
  streamText,
  type StreamTextResult,
} from 'ai';
import { after } from 'next/server';
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream';

/**
 * Maximum execution duration for chat API endpoints
 */
export const maxDuration = 60;

/**
 * Global resumable stream context for chat operations
 */
let globalStreamContext: ResumableStreamContext | null = null;

/**
 * Gets or creates the global stream context for resumable streams
 * @returns Resumable stream context or null if unavailable
 */
export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        logInfo('Resumable streams are disabled due to missing REDIS_URL');
      } else {
        logError('Error creating resumable stream context', { error });
      }
    }
  }

  return globalStreamContext;
}

/**
 * Create telemetry middleware for chat operations
 */
const chatTelemetry = createTelemetryMiddleware({
  isEnabled: isProductionEnvironment,
  functionId: 'chat-stream',
  metadata: {
    service: 'ai-chatbot',
    version: '1.0.0',
  },
});

// Enhanced middleware (temporarily disabled until imports are fixed)
// const cachingMiddleware = createCachingMiddleware({
//   enabled: isProductionEnvironment,
//   ttl: 60 * 60 * 1000, // 1 hour cache
// });

// const loggingMiddleware = createLoggingMiddleware({
//   enabled: !isProductionEnvironment,
// });

// const retryMiddleware = createRetryMiddleware(
//   isProductionEnvironment
//     ? retryPresets.production()
//     : retryPresets.development()
// );

/**
 * Create error recovery strategy with simplified configuration
 */
const errorRecovery = createErrorRecovery({});

/**
 * Handles POST requests for chat streaming with AI models
 * @param request - HTTP request containing chat message and configuration
 * @returns Streaming response with AI-generated content
 */
export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();

    // Validate JSON size to prevent DoS attacks
    const jsonString = JSON.stringify(json);
    if (jsonString.length > 1024 * 1024) {
      // 1MB limit
      return new ChatSDKError('bad_request:api').toResponse();
    }

    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    logError('Invalid request body in chat API', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    let uiMessages = [...convertToUIMessages(messagesFromDb), message];

    // Context7 integration - enhance the latest user message with library documentation
    try {
      const lastMessage = uiMessages[uiMessages.length - 1];
      if (lastMessage && lastMessage.role === 'user') {
        const messageText = lastMessage.parts
          .filter(part => part.type === 'text')
          .map(part => {
            // Sanitize text to prevent injection attacks
            const sanitized =
              typeof part.text === 'string'
                ? part.text.slice(0, 10000) // Limit length to 10k chars
                : '';
            return sanitized;
          })
          .join(' ');

        const context7Context = {
          user: { id: session.user.id },
          sessionId: id,
        };

        const enhancement = await context7Integration.enhanceMessageWithContext7(
          messageText,
          context7Context,
        );

        if (enhancement.usedContext7 && enhancement.enhancedMessage !== messageText) {
          // Update the last message with enhanced content
          const enhancedMessage = {
            ...lastMessage,
            parts: [
              ...lastMessage.parts.filter(part => part.type !== 'text'),
              {
                type: 'text' as const,
                text: enhancement.enhancedMessage,
              },
            ],
          };

          uiMessages = [...uiMessages.slice(0, -1), enhancedMessage];

          logInfo('Context7: Message enhanced with documentation', {
            operation: 'context7_chat_enhancement',
            metadata: {
              chatId: id,
              userId: session.user.id,
              librariesFound: enhancement.librariesFound,
              documentationAdded: enhancement.documentationAdded,
              originalLength: messageText.length,
              enhancedLength: enhancement.enhancedMessage.length,
            },
          });
        }
      }
    } catch (error) {
      // Context7 enhancement is not critical - log warning and continue
      logError('Context7: Failed to enhance message, continuing without enhancement', {
        operation: 'context7_chat_enhancement_failed',
        metadata: { chatId: id, userId: session.user.id },
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: 'user',
          parts: message.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    // Wrap the stream creation with telemetry
    const stream = await chatTelemetry.track(
      async () => {
        return createStandardUIMessageStream({
          execute: async dataStream => {
            // Create RAG tools with feature flag context and filter out undefined values
            const ragContext = {
              user: { id: session.user.id },
              environment: process.env.NODE_ENV,
            };
            const ragToolsRaw = isRAGEnabled()
              ? createChatbotRAGTools({ session, context: ragContext })
              : {};
            const ragTools = Object.fromEntries(
              Object.entries(ragToolsRaw).filter(([, tool]) => tool !== undefined),
            );

            // Get MCP tools with feature flag awareness
            const mcpToolsResult = await (() => {
              try {
                return createMcpToolsWithFeatureFlags(userType, {
                  user: { id: session.user.id },
                  environment: process.env.NODE_ENV,
                });
              } catch (error) {
                logError('Failed to create MCP tools with feature flags', {
                  error,
                  userId: session.user.id,
                  userType,
                });
                // Return fallback structure for graceful degradation
                return {
                  tools: {},
                  clientType: 'mock' as const,
                  features: {},
                  metadata: {
                    isEnhancedMode: false,
                    isDemoMode: false,
                    capabilities: [],
                    configSummary: { mode: 'error-fallback' },
                  },
                };
              }
            })();

            const mcpTools = mcpToolsResult.tools;

            // Create MCP stream lifecycle wrapper for comprehensive monitoring
            const streamLifecycle = createMcpStreamLifecycleWrapper(
              {
                user: { id: session.user.id },
                environment: process.env.NODE_ENV,
              },
              {
                streamId,
                chatId: id,
                userId: session.user.id,
                modelId: selectedChatModel,
                mcpClientType: mcpToolsResult.clientType,
                mcpEnhanced: mcpToolsResult.metadata.isEnhancedMode,
                capabilities: mcpToolsResult.metadata.capabilities,
                mcpTools,
              },
            );

            // Start stream lifecycle tracking
            streamLifecycle.startStream();

            // Get lifecycle hooks for monitoring
            // const lifecycleHooks = getLifecycleHooks(isProductionEnvironment);

            // // Wrap model with lifecycle monitoring first
            // const modelWithLifecycle = wrapModelWithLifecycle(
            //   myProvider.languageModel(selectedChatModel),
            //   lifecycleHooks
            // );

            // // Then wrap with retry middleware for production reliability
            // const wrappedModel = wrapLanguageModel({
            //   model: modelWithLifecycle,
            //   middleware: [retryMiddleware],
            // });

            // Use base model for now
            const wrappedModel = myProvider.languageModel(selectedChatModel);

            // Check if model supports reasoning (includes all Claude 4 models which have built-in reasoning)
            const isAnthropicReasoningModel =
              selectedChatModel.includes('reasoning') ||
              selectedChatModel.includes('claude-sonnet-reasoning') ||
              selectedChatModel.includes('anthropic:sonnet-reasoning') ||
              selectedChatModel.includes('claude-4-opus') ||
              selectedChatModel.includes('claude-4-sonnet') ||
              selectedChatModel.includes('claude-3-7-sonnet') ||
              selectedChatModel.includes('anthropic:claude-4-opus') ||
              selectedChatModel.includes('anthropic:claude-4-sonnet') ||
              selectedChatModel.includes('anthropic:claude-3-7-sonnet');

            // Check if model supports sources (Perplexity models with search capabilities)
            const isPerplexitySearchModel =
              selectedChatModel.includes('perplexity:') ||
              selectedChatModel.includes('sonar') ||
              selectedChatModel.includes('perplexity-') ||
              selectedChatModel === 'perplexity';

            // Create comprehensive AI SDK v5 error handling and lifecycle management
            const streamTextConfig = {
              model: wrappedModel,
              system: systemPrompt({ selectedChatModel, requestHints, userType }),
              messages: convertToModelMessages(uiMessages),
              maxSteps: 5,
              experimental_transform: defaultStreamTransform,

              // Add reasoning headers for Anthropic models
              ...(isAnthropicReasoningModel && {
                headers: {
                  'anthropic-beta': 'interleaved-thinking-2025-05-14',
                },
                providerOptions: {
                  anthropic: {
                    thinking: { type: 'enabled' as const, budgetTokens: 15000 },
                  },
                },
              }),

              // AI SDK v5 Error Handling with Stream Lifecycle Integration
              onError: (event: { error: unknown }) => {
                const error =
                  event.error instanceof Error ? event.error : new Error(String(event.error));

                // Record error in stream lifecycle
                streamLifecycle.recordError(error);

                logError('AI SDK v5 Stream Error', {
                  operation: 'chat_stream_error',
                  metadata: {
                    streamId,
                    chatId: id,
                    userId: session.user.id,
                    model: selectedChatModel,
                    error: error.message,
                    mcpClientType: mcpToolsResult.clientType,
                    mcpFeatures: Object.keys(mcpToolsResult.features),
                  },
                  error,
                });

                // Log MCP-specific error context if enhanced mode is enabled
                if (mcpToolsResult.metadata.isEnhancedMode) {
                  logError('Enhanced MCP context during error', {
                    operation: 'mcp_enhanced_error_context',
                    metadata: {
                      streamId,
                      capabilities: mcpToolsResult.metadata.capabilities,
                      configSummary: mcpToolsResult.metadata.configSummary,
                    },
                  });
                }
              },

              // Stream lifecycle management with enhanced tracking
              onFinish: (result: {
                finishReason?: string;
                usage?: any;
                text?: string;
                toolCalls?: any[];
                toolResults?: any[];
              }) => {
                // Finish stream lifecycle tracking
                const finalStatus = result.finishReason === 'error' ? 'error' : 'completed';
                streamLifecycle.finishStream(finalStatus);

                logInfo('AI SDK v5 Stream Finished', {
                  operation: 'chat_stream_finish',
                  metadata: {
                    streamId,
                    chatId: id,
                    userId: session.user.id,
                    model: selectedChatModel,
                    finishReason: result.finishReason,
                    usage: result.usage,
                    textLength: result.text?.length,
                    toolCallsCount: result.toolCalls?.length || 0,
                    toolResultsCount: result.toolResults?.length || 0,
                    mcpClientType: mcpToolsResult.clientType,
                    mcpEnhanced: mcpToolsResult.metadata.isEnhancedMode,
                    streamMetrics: streamLifecycle.getMetrics?.() || null,
                  },
                });

                // Record tool calls in stream lifecycle and log MCP usage analytics
                if (result.toolCalls && result.toolCalls.length > 0) {
                  result.toolCalls.forEach(toolCall => {
                    const toolResult = result.toolResults?.find(
                      r => r.toolCallId === toolCall.toolCallId,
                    );
                    streamLifecycle.recordToolCall(toolCall.toolName, toolResult);
                  });

                  const mcpToolCalls = result.toolCalls.filter(call =>
                    Object.keys(mcpTools).includes(call.toolName),
                  );

                  if (mcpToolCalls.length > 0) {
                    logInfo('MCP Tools Usage', {
                      operation: 'mcp_tools_usage',
                      metadata: {
                        streamId,
                        chatId: id,
                        userId: session.user.id,
                        mcpClientType: mcpToolsResult.clientType,
                        mcpToolsUsed: mcpToolCalls.map(call => call.toolName),
                        enhancedMode: mcpToolsResult.metadata.isEnhancedMode,
                        capabilities: mcpToolsResult.metadata.capabilities,
                      },
                    });
                  }
                }
              },

              // Add tools only for non-reasoning models, but include computer tools for enhanced models
              ...(selectedChatModel !== 'chat-model-reasoning' && {
                tools: {
                  // Core tools
                  getWeather,
                  createDocument: createDocument({ session, dataStream }),
                  updateDocument: updateDocument({ session, dataStream }),
                  requestSuggestions: requestSuggestions({
                    session,
                  }),
                  // Enhanced tools based on user type
                  ...getToolsForUserType(userType),
                  // Add structured data generation tools
                  ...getStructuredDataTools(userType),
                  // Add image generation tools
                  ...getImageGenerationTools(userType),
                  // Add RAG tools if enabled
                  ...ragTools,
                  // Add MCP tools with feature flag awareness
                  ...mcpTools,

                  // Add Anthropic computer tools for enhanced user types and Anthropic models
                  ...(userType !== 'guest' &&
                    (selectedChatModel.includes('claude') ||
                      selectedChatModel.includes('anthropic:')) && {
                      bash: createBashTool(async ({ command }) => {
                        // Simulated bash execution for security
                        return `[Simulated] Executed: ${command}`;
                      }),
                      str_replace_editor: createTextEditorTool(async ({ command, path }) => {
                        // Simulated text editor for security
                        if (command === 'create') {
                          return `[Simulated] Created file: ${path}`;
                        }
                        return `[Simulated] Executed ${command} on ${path}`;
                      }),
                      computer: createComputerTool({
                        displayWidthPx: 1920,
                        displayHeightPx: 1080,
                        execute: async ({ action }) => {
                          // Simulated computer actions for security
                          if (action === 'screenshot') {
                            return {
                              type: 'image' as const,
                              data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                            };
                          }
                          return `[Simulated] Executed ${action} action`;
                        },
                        experimental_toToolResultContent: result => {
                          return typeof result === 'string'
                            ? [{ type: 'text', text: result }]
                            : [{ type: 'image', data: result.data, mediaType: 'image/png' }];
                        },
                      }),
                    }),
                },
              }),
            };

            // Use error recovery for the streamText operation with enhanced config and lifecycle tracking
            const result: StreamTextResult<any, any> = await errorRecovery.executeWithRecovery(
              async () => streamText(streamTextConfig),
              {
                modelId: selectedChatModel,
              },
            );

            // Use AI SDK v5 merging pattern with dataStream and enhanced message handling
            const uiMessageStream = result.toUIMessageStream({
              // Enable reasoning display for Anthropic reasoning models
              sendReasoning: isAnthropicReasoningModel,
              // Enable sources for Perplexity search models
              sendSources: isPerplexitySearchModel,
              onFinish: async ({ messages }: { messages: any[] }) => {
                try {
                  logInfo('Saving messages with MCP context', {
                    operation: 'chat_messages_save',
                    metadata: {
                      chatId: id,
                      userId: session.user.id,
                      messageCount: messages.length,
                      mcpClientType: mcpToolsResult.clientType,
                      mcpEnhanced: mcpToolsResult.metadata.isEnhancedMode,
                    },
                  });

                  await saveMessages({
                    messages: messages.map((message: any) => ({
                      id: message.id,
                      role: message.role,
                      parts: message.parts,
                      createdAt: new Date(),
                      attachments: [],
                      chatId: id,
                    })),
                  });

                  // Log successful completion for MCP analytics
                  if (mcpToolsResult.metadata.isEnhancedMode) {
                    logInfo('Enhanced MCP chat completion', {
                      operation: 'mcp_enhanced_chat_complete',
                      metadata: {
                        chatId: id,
                        userId: session.user.id,
                        capabilities: mcpToolsResult.metadata.capabilities,
                        features: Object.keys(mcpToolsResult.features),
                      },
                    });
                  }
                } catch (error) {
                  logError('Failed to save messages with MCP context', {
                    operation: 'chat_messages_save_error',
                    metadata: {
                      chatId: id,
                      userId: session.user.id,
                      messageCount: messages.length,
                      mcpClientType: mcpToolsResult.clientType,
                    },
                    error: error instanceof Error ? error : new Error(String(error)),
                  });
                  throw error;
                }
              },
            });

            // Wrap the UI message stream to track chunks
            const enhancedStream = new ReadableStream({
              start(controller) {
                const reader = uiMessageStream.getReader();

                function pump(): Promise<void> {
                  return reader
                    .read()
                    .then(({ done, value }) => {
                      if (done) {
                        controller.close();
                        return;
                      }

                      // Record chunk in stream lifecycle
                      streamLifecycle.recordChunk(value);

                      controller.enqueue(value);
                      return pump();
                    })
                    .catch(error => {
                      // Record error and abort stream lifecycle
                      streamLifecycle.recordError(error);
                      streamLifecycle.abortStream('Stream read error');
                      controller.error(error);
                    });
                }

                return pump();
              },
            });

            dataStream.merge(enhancedStream);
          },
        });
      },
      {
        metadata: {
          chatId: id,
          userId: session.user.id,
          model: selectedChatModel,
          visibility: selectedVisibilityType,
          messageCount: uiMessages.length,
          // Enhanced MCP telemetry - will be populated after MCP tools are created
          mcpClientType: 'unknown',
          mcpEnhanced: false,
          mcpDemo: false,
          mcpCapabilities: [],
          mcpFeatureCount: 0,
        },
      },
    );

    // Log analytics periodically in production
    if (isProductionEnvironment && Math.random() < 0.1) {
      // 10% sampling
      const analytics = LifecycleAnalytics.getInstance();
      logInfo('AI Chat Analytics', analytics.getMetrics());
    }

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

/**
 * Handles DELETE requests to remove a chat
 * @param request - HTTP request with chat ID to delete
 * @returns JSON response confirming deletion
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
