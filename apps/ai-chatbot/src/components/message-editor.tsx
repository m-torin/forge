'use client';

import { deleteTrailingMessages } from '#/app/(chat)/actions';
import { Button } from '#/components/ui/button';
import { Textarea } from '#/components/ui/textarea';
import type { ChatMessage } from '#/lib/types';
import { getTextFromMessage } from '#/lib/utils';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useInputState, useToggle } from '@mantine/hooks';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';

/**
 * Props for the MessageEditor component
 */
export type MessageEditorProps = {
  message: ChatMessage;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
};

/**
 * Message editor component for editing chat messages inline
 * @param message - Message to edit
 * @param setMode - Function to toggle between view and edit modes
 * @param setMessages - Function to update messages array
 * @param reload - Function to reload the conversation
 */
export function MessageEditor({ message, setMode, setMessages, reload }: MessageEditorProps) {
  const [isSubmitting, toggleSubmitting] = useToggle([false, true]);

  const [draftContent, setDraftContent] = useInputState(getTextFromMessage(message));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event);
    adjustHeight();
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="w-full resize-none overflow-hidden rounded-xl bg-transparent !text-base outline-none"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          className="h-fit px-3 py-2"
          onClick={() => {
            setMode('view');
          }}
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          className="h-fit px-3 py-2"
          disabled={isSubmitting}
          onClick={async () => {
            toggleSubmitting(true);

            await deleteTrailingMessages({
              id: message.id,
            });

            setMessages(messages => {
              const index = messages.findIndex(m => m.id === message.id);

              if (index !== -1) {
                const updatedMessage: ChatMessage = {
                  ...message,
                  parts: [{ type: 'text', text: draftContent }],
                };

                return [...messages.slice(0, index), updatedMessage];
              }

              return messages;
            });

            setMode('view');
            reload();
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
