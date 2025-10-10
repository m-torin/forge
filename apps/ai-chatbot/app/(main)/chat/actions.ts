'use server';

import type { VisibilityType } from '@/components/visibility-selector';
import { DEFAULT_CHAT_MODEL, isChatModelId, type ChatModelId } from '@/lib/ai/models';
import { myProvider } from '@/lib/ai/providers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { generateText } from '@repo/ai';
import type { ModelMessage, UIMessage } from 'ai';
import { cookies } from 'next/headers';

export async function saveChatModelAsCookie(model: string) {
  const modelId: ChatModelId = isChatModelId(model) ? model : DEFAULT_CHAT_MODEL;
  const cookieStore = await cookies();
  cookieStore.set('chat-model', modelId);
}

export async function generateTitleFromUserMessage({ message }: { message: UIMessage }) {
  const promptMessages: ModelMessage[] = [
    {
      role: 'system',
      content: `
- you will generate a short title based on the first message a user begins a conversation with
- ensure it is not more than 80 characters long
- the title should be a summary of the user's message
- do not use quotes or colons`,
    },
    {
      role: 'user',
      content: JSON.stringify(message),
    },
  ];

  const { text: generatedTitle } = await generateText(promptMessages, {
    model: myProvider.languageModel('title-model'),
  });

  return generatedTitle ?? 'New Chat';
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
