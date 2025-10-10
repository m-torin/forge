import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { ChatModelId } from '@/lib/ai/models';
import { DEFAULT_CHAT_MODEL, isChatModelId } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { auth } from '../../(auth)/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const cookieModelValue = cookieStore.get('chat-model')?.value;
  const initialChatModel: ChatModelId = isChatModelId(cookieModelValue ?? '')
    ? (cookieModelValue as ChatModelId)
    : DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={initialChatModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}
