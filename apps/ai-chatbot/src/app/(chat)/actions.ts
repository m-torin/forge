'use server';

import type { VisibilityType } from '#/components/visibility-selector';
import { myProvider } from '#/lib/ai/providers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '#/lib/db/queries';
import type { UIMessage } from '@ai-sdk/react';
import { generateText } from 'ai';
import { cookies } from 'next/headers';

/**
 * Saves the selected chat model as a cookie
 * @param model - The model identifier to save
 */
export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

/**
 * Generates a chat title from the user's first message
 * @param message - The user message to generate title from
 * @returns Generated title string
 */
export async function generateTitleFromUserMessage({ message }: { message: UIMessage }) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `

    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

/**
 * Deletes messages after a specified message timestamp
 * @param id - The message ID to delete trailing messages after
 */
export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

/**
 * Updates the visibility setting for a chat
 * @param chatId - The chat ID to update
 * @param visibility - The new visibility setting
 */
export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
