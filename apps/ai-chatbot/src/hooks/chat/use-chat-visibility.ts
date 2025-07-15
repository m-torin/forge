'use client';

import { updateChatVisibility } from '#/app/(chat)/actions';
import { getChatHistoryPaginationKey, type ChatHistory } from '#/components/sidebar-history';
import type { VisibilityType } from '#/components/visibility-selector';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';
import { useSWRConfig } from 'swr';
import { unstable_serialize } from 'swr/infinite';

export function useChatVisibility({
  chatId,
  initialVisibilityType,
}: {
  chatId: string;
  initialVisibilityType: VisibilityType;
}) {
  const { mutate, cache } = useSWRConfig();
  const history: ChatHistory = cache.get('/api/history')?.data;

  const [localVisibility, setLocalVisibility] = useLocalStorage<VisibilityType>({
    key: `${chatId}-visibility`,
    defaultValue: initialVisibilityType,
  });

  const visibilityType = useMemo(() => {
    if (!history) return localVisibility;
    const chat = history.chats.find(chat => chat.id === chatId);
    if (!chat) return 'private';
    return chat.visibility;
  }, [history, chatId, localVisibility]);

  const setVisibilityType = useCallback(
    (updatedVisibilityType: VisibilityType) => {
      setLocalVisibility(updatedVisibilityType);
      mutate(unstable_serialize(getChatHistoryPaginationKey));

      updateChatVisibility({
        chatId: chatId,
        visibility: updatedVisibilityType,
      });
    },
    [setLocalVisibility, mutate, chatId],
  );

  return { visibilityType, setVisibilityType };
}
