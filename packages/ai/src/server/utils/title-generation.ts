import { generateText, type LanguageModel, type ModelMessage, type UIMessage } from 'ai';
import 'server-only';

/**
 * Configuration for title generation
 */
export interface TitleGenerationConfig {
  /** Maximum length of the generated title */
  maxLength?: number;
  /** Custom system prompt for title generation */
  systemPrompt?: string;
}

/**
 * Default system prompt for title generation
 */
const DEFAULT_SYSTEM_PROMPT = `You will generate a short title based on the first message a user begins a conversation with.
- Ensure it is not more than 80 characters long
- The title should be a summary of the user's message
- Do not use quotes or colons
- Keep it concise and descriptive`;

/**
 * Generate a title from a user message using AI
 */
export async function generateTitleFromMessage(
  model: LanguageModel,
  message: ModelMessage | UIMessage | string,
  config: TitleGenerationConfig = {},
): Promise<string> {
  const { maxLength = 80, systemPrompt = DEFAULT_SYSTEM_PROMPT } = config;

  const prompt = typeof message === 'string' ? message : JSON.stringify(message);

  const { text: title } = await generateText({
    model,
    system: systemPrompt,
    prompt,
  });

  // Ensure title doesn't exceed max length
  return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title;
}

/**
 * Generate a title from the first user message in a conversation
 */
export async function generateTitleFromFirstMessage(
  model: LanguageModel,
  messages: ModelMessage[],
  config?: TitleGenerationConfig,
): Promise<string> {
  const firstUserMessage = messages.find(msg => msg.role === 'user');

  if (!firstUserMessage) {
    throw new Error('No user message found in conversation');
  }

  return generateTitleFromMessage(model, firstUserMessage, config);
}

/**
 * Generate a title from conversation context
 */
export async function generateTitleFromConversation(
  model: LanguageModel,
  messages: ModelMessage[],
  config: TitleGenerationConfig = {},
): Promise<string> {
  const {
    maxLength = 80,
    systemPrompt = 'Generate a concise title that summarizes this conversation. Keep it under 80 characters and avoid quotes or colons.',
  } = config;

  // Take first few messages for context
  const contextMessages = messages.slice(0, 4);
  const conversationContext = contextMessages
    .map(msg => `${msg.role}: ${JSON.stringify(msg.content)}`)
    .join('\n');

  const { text: title } = await generateText({
    model,
    system: systemPrompt,
    prompt: conversationContext,
  });

  return title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title;
}

/**
 * Generate a title from a UIMessage (chatbot-specific convenience function)
 */
export async function generateTitleFromUIMessage(
  model: LanguageModel,
  message: UIMessage,
  config?: TitleGenerationConfig,
): Promise<string> {
  return generateTitleFromMessage(model, message, config);
}
