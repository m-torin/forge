'use client';

import type { LanguageModelUsage, UIMessage } from 'ai';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { saveChatModelAsCookie } from '@/app/(main)/chat/actions';
import { SelectItem } from '@/components/ui/select';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { REASONING_CHAT_MODEL_ID, chatModels, type ChatModelId } from '@/lib/ai/models';
import { myProvider } from '@/lib/ai/providers';
import type { Attachment, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { UseChatHelpers } from '@ai-sdk/react';
import { ArrowUpIcon, StopIcon } from '@radix-ui/react-icons';
import { Input, PromptInputSubmit, PromptInputTextarea } from '@repo/ai/ui/react';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Paperclip } from 'lucide-react';
import { startTransition } from 'react';
import { getContextWindow, normalizeUsage } from 'tokenlens';
import { Context } from './elements/context';
import {
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectTrigger,
  PromptInputToolbar,
  PromptInputTools,
} from './elements/prompt-input';
import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';
import { Button } from './ui/button';
import type { VisibilityType } from './visibility-selector';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType: _selectedVisibilityType,
  selectedModelId,
  usage,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: ChatModelId;
  usage?: LanguageModelUsage;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  }, []);

  const resetHeight = adjustHeight;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    adjustHeight();
    textareaRef.current.focus();
  }, [adjustHeight]);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '');
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) {
      return;
    }

    if (!textareaRef.current) {
      return;
    }

    const domValue = textareaRef.current.value;
    // Prefer DOM value over localStorage to handle hydration
    const finalValue = domValue || localStorageInput || '';
    setInput(finalValue);
    adjustHeight();
    hasHydratedRef.current = true;
  }, [adjustHeight, localStorageInput, setInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map(attachment => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    resetHeight,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const modelResolver = useMemo(() => {
    return myProvider.languageModel(selectedModelId);
  }, [selectedModelId]);

  const contextMax = useMemo(() => {
    // Resolve from selected model; stable across chunks.
    const cw = getContextWindow(modelResolver.modelId);
    return cw.combinedMax ?? cw.inputMax ?? 0;
  }, [modelResolver]);

  const usedTokens = useMemo(() => {
    // Prefer explicit usage data part captured via onData
    if (!usage) return 0; // update only when final usage arrives
    const n = normalizeUsage(usage);
    return typeof n.total === 'number' ? n.total : (n.input ?? 0) + (n.output ?? 0);
  }, [usage]);

  const contextProps = useMemo(
    () => ({
      maxOutputTokens: contextMax,
      usedTokens,
      usage,
      modelId: modelResolver.modelId,
      showBreakdown: true as const,
    }),
    [contextMax, usedTokens, usage, modelResolver],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map(file => file.name));

      try {
        const uploadPromises = files.map(file => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          attachment => attachment !== undefined,
        );

        setAttachments(currentAttachments => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className={cn('relative flex w-full flex-col gap-4', className)}>
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -top-12 left-1/2 z-50 -translate-x-1/2"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={event => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions sendMessage={sendMessage} chatId={chatId} />
      )}

      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <Input
        className="rounded-xl border border-border bg-background shadow-sm transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          if (status !== 'ready') {
            toast.error('Please wait for the model to finish its response!');
          } else {
            submitForm();
          }
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            data-testid="attachments-preview"
            className="flex flex-row items-end gap-2 overflow-x-scroll px-3 py-2"
          >
            {attachments.map(attachment => (
              <PreviewAttachment
                key={attachment.url}
                attachment={attachment}
                onRemove={() => {
                  setAttachments(currentAttachments =>
                    currentAttachments.filter(a => a.url !== attachment.url),
                  );
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              />
            ))}

            {uploadQueue.map(filename => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: '',
                  name: filename,
                  contentType: '',
                }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        <PromptInputTextarea
          data-testid="multimodal-input"
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className="resize-none !border-0 !border-none bg-transparent px-3 py-3 text-sm outline-none ring-0 [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-scrollbar]:hidden"
          rows={1}
        />
        <PromptInputToolbar className="!border-top-0 !border-t-0 px-3 py-2 shadow-none dark:border-0 dark:!border-transparent">
          <PromptInputTools className="gap-2">
            <AttachmentsButton
              fileInputRef={fileInputRef}
              status={status}
              selectedModelId={selectedModelId}
            />
            <ModelSelectorCompact selectedModelId={selectedModelId} />
            <Context {...contextProps} />
          </PromptInputTools>
          {status === 'submitted' ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <PromptInputSubmit
              status={status === 'error' ? 'loading' : status}
              disabled={!input.trim() || uploadQueue.length > 0}
              className="rounded-full bg-primary p-2 text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </Input>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

  return true;
});

function PureAttachmentsButton({
  fileInputRef,
  status,
  selectedModelId,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
  selectedModelId: ChatModelId;
}) {
  const isReasoningModel = selectedModelId === REASONING_CHAT_MODEL_ID;

  return (
    <Button
      data-testid="attachments-button"
      className="h-fit rounded-md p-1.5 transition-colors duration-200 hover:bg-muted"
      onClick={event => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready' || isReasoningModel}
      variant="ghost"
      size="sm"
    >
      <Paperclip className="h-[14px] w-[14px]" />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({ selectedModelId }: { selectedModelId: ChatModelId }) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  const selectedModel = chatModels.find(model => model.id === optimisticModelId);

  return (
    <PromptInputModelSelect
      value={selectedModel?.name}
      onValueChange={modelName => {
        const model = chatModels.find(m => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id);
          });
        }
      }}
    >
      <PromptInputModelSelectTrigger
        type="button"
        className="text-xs focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=closed]:ring-0 data-[state=open]:ring-0"
      >
        {selectedModel?.name || 'Select model'}
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {chatModels.map(model => (
          <SelectItem key={model.id} value={model.name}>
            <div className="flex flex-col items-start gap-1 py-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
            </div>
          </SelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="h-fit rounded-full border border-border p-2 transition-colors duration-200 hover:bg-muted"
      onClick={event => {
        event.preventDefault();
        stop();
        setMessages(messages => messages);
      }}
      variant="outline"
      size="sm"
    >
      <StopIcon className="h-4 w-4" />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
