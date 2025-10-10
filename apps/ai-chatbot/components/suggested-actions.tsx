'use client';

import type { ChatMessage } from '@/lib/types';
import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Suggestion } from './elements/suggestion';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
}

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const suggestedActions = [
    'What are the advantages of using Next.js?',
    "Write code to demonstrate Dijkstra's algorithm",
    'Help me write an essay about Silicon Valley',
    'What is the weather in San Francisco?',
  ];

  return (
    <div data-testid="suggested-actions" className="grid w-full gap-2 sm:grid-cols-2">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={suggestedAction}
        >
          <Suggestion
            suggestion={suggestedAction}
            onClick={suggestion => {
              window.history.replaceState({}, '', `/chat/${chatId}`);
              sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: suggestion }],
              });
            }}
            className="h-auto w-full whitespace-normal p-3 text-left"
          >
            {suggestedAction}
          </Suggestion>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, (prevProps, nextProps) => {
  if (prevProps.chatId !== nextProps.chatId) return false;

  return true;
});
