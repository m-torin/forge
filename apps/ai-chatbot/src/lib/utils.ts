import type { DBMessage, Document } from '#/lib/db/schema';
import type { CoreAssistantMessage, CoreToolMessage, UIMessage } from 'ai';
import { generateId } from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { formatISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { ChatSDKError, type ErrorCode } from './errors';
import type { ChatMessage } from './types';

/**
 * Combines and merges Tailwind CSS classes
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generic fetcher function with error handling
 * @param url - URL to fetch
 * @returns Promise resolving to JSON response
 */
export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

/**
 * Fetch wrapper with comprehensive error handling
 * @param input - Request info or URL
 * @param init - Request initialization options
 * @returns Promise resolving to Response object
 */
export async function fetchWithErrorHandlers(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    throw error;
  }
}

/**
 * Safely retrieves data from localStorage
 * @param key - Storage key
 * @returns Parsed JSON data or empty array
 */
export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

/**
 * Use AI SDK's generateId for consistency
 */
export const generateUUID = generateId;

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

/**
 * Gets the most recent user message from an array
 * @param messages - Array of UI messages
 * @returns Most recent user message or undefined
 */
export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter(message => message.role === 'user');
  return userMessages.at(-1);
}

/**
 * Gets document timestamp by index with fallback
 * @param documents - Array of documents
 * @param index - Document index
 * @returns Document timestamp or current date
 */
export function getDocumentTimestampByIndex(documents: Array<Document>, index: number) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

/**
 * Gets the ID of the last message in an array
 * @param messages - Array of response messages
 * @returns Message ID or null if no messages
 */
export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

/**
 * Sanitizes text by removing function call markers
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

/**
 * Converts database messages to UI message format
 * @param messages - Array of database messages
 * @returns Array of chat messages for UI
 */
export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map(message => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as any[], // In AI SDK v5, parts array type is handled automatically
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

/**
 * Extracts text content from a chat message
 * @param message - Chat message to extract text from
 * @returns Combined text content
 */
export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('');
}
