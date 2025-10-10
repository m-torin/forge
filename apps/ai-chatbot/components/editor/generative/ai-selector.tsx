'use client';

import { Command, CommandInput } from '@/components/ui/command';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompletion } from '@ai-sdk/react';
import { addAIHighlight, useEditor } from '@repo/editing';
import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import CrazySpinner from '../ui/icons/crazy-spinner';
import Magic from '../ui/icons/magic';
import AICompletionCommands from './ai-completion-command';
import AISelectorCommands from './ai-selector-commands';
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

export function AISelector({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { completion, complete, isLoading } = useCompletion({
    // id: "editor",
    api: '/api/generate',
    onError: e => {
      toast.error(e.message);
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose prose-sm p-2 px-4">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic className="mr-2 h-4 w-4 shrink-0" />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={
                hasCompletion ? 'Tell AI what to do next' : 'Ask AI to edit or generate...'
              }
              onFocus={() => editor && addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={async () => {
                try {
                  if (completion) {
                    await complete(completion, {
                      body: { option: 'zap', command: inputValue },
                    });
                    setInputValue('');
                    return;
                  }

                  if (!editor) {
                    return;
                  }

                  const slice = editor.state.selection.content();
                  const markdownSerializer = (editor.storage as any).markdown?.serializer;
                  const text = markdownSerializer?.serialize(slice.content) ?? editor.getText();

                  await complete(text, {
                    body: { option: 'zap', command: inputValue },
                  });

                  setInputValue('');
                } catch (error: unknown) {
                  const message =
                    error instanceof Error ? error.message : 'Failed to run AI command';
                  toast.error(message);
                }
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                if (editor) {
                  editor.chain().unsetHighlight().focus().run();
                }
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) => complete(value, { body: { option } })}
            />
          )}
        </>
      )}
    </Command>
  );
}
