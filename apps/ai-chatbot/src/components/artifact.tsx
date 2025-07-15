import { codeArtifact } from '#/artifacts/code/client';
import { imageArtifact } from '#/artifacts/image/client';
import { sheetArtifact } from '#/artifacts/sheet/client';
import { textArtifact } from '#/artifacts/text/client';
import { ArtifactActions } from '#/components/artifact-actions';
import { ArtifactCloseButton } from '#/components/artifact-close-button';
import { ArtifactMessages } from '#/components/artifact-messages';
import { MultimodalInput } from '#/components/multimodal-input';
import { Toolbar } from '#/components/toolbar';
import { useSidebar } from '#/components/ui/sidebar';
import { VersionFooter } from '#/components/version-footer';
import type { VisibilityType } from '#/components/visibility-selector';
import { useArtifact } from '#/hooks/use-artifact';
import type { Document, Vote } from '#/lib/db/schema';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { Attachment, ChatMessage, CustomUIDataTypes, MessageMetadata } from '#/lib/types';
import { APPLE_BREAKPOINTS, SPRING, Z_INDEX } from '#/lib/ui-constants';
import { cn, fetcher } from '#/lib/utils';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useDebouncedCallback, useViewportSize } from '@mantine/hooks';
import { formatDistance } from 'date-fns';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useSWR, { useSWRConfig } from 'swr';

/**
 * Available artifact type definitions
 */
export const artifactDefinitions: any[] = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
];

/**
 * Union type of all artifact kinds
 */
export type ArtifactKind = (typeof artifactDefinitions)[number]['kind'];

/**
 * Interface for UI artifact representation
 */
export interface UIArtifact {
  title: string;
  documentId: string;
  kind: ArtifactKind;
  content: string;
  isVisible: boolean;
  status: 'streaming' | 'idle';
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

function PureArtifact({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  append,
  messages,
  setMessages,
  reload,
  votes,
  isReadonly,
  selectedVisibilityType,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['status'];
  stop: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['stop'];
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['setMessages'];
  votes: Array<Vote> | undefined;
  append: UseChatHelpers<MessageMetadata, CustomUIDataTypes>['append'];
  reload: () => Promise<string | null | undefined>;
  isReadonly: boolean;
  selectedVisibilityType: VisibilityType;
}) {
  const { artifact, setArtifact, metadata, setMetadata } = useArtifact();
  const prototypeMode = isPrototypeMode();

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Array<Document>>(
    !prototypeMode && artifact.documentId !== 'init' && artifact.status !== 'streaming'
      ? `/api/document?id=${artifact.documentId}`
      : null,
    fetcher,
  );

  const [mode, setMode] = useState<'edit' | 'diff'>('edit');
  const [document, setDocument] = useState<Document | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  // Enhanced mock documents for prototype mode with version history
  const mockDocuments: Array<Document> = useMemo(
    () =>
      prototypeMode
        ? [
            {
              id: `mock-doc-${artifact.documentId}-1`,
              title: artifact.title,
              content: artifact.content,
              kind: artifact.kind,
              createdAt: new Date(Date.now() - 300000), // 5 minutes ago
              userId: 'mock-user',
            },
            {
              id: `mock-doc-${artifact.documentId}-2`,
              title: artifact.title,
              content: artifact.content.replace(/Hello/g, 'Hello Enhanced'),
              kind: artifact.kind,
              createdAt: new Date(Date.now() - 120000), // 2 minutes ago
              userId: 'mock-user',
            },
            {
              id: `mock-doc-${artifact.documentId}-3`,
              title: artifact.title,
              content: artifact.content,
              kind: artifact.kind,
              createdAt: new Date(), // now
              userId: 'mock-user',
            },
          ]
        : [],
    [prototypeMode, artifact.documentId, artifact.title, artifact.content, artifact.kind],
  );

  const { open: isSidebarOpen } = useSidebar();

  useEffect(() => {
    const docsToProcess = prototypeMode ? mockDocuments : documents;

    if (docsToProcess && docsToProcess.length > 0) {
      const mostRecentDocument = docsToProcess.at(-1);

      if (mostRecentDocument) {
        setDocument(mostRecentDocument);
        setCurrentVersionIndex(docsToProcess.length - 1);
        setArtifact(currentArtifact => ({
          ...currentArtifact,
          content: mostRecentDocument.content ?? '',
        }));
      }
    }
  }, [documents, mockDocuments, prototypeMode, setArtifact]);

  useEffect(() => {
    mutateDocuments();
  }, [artifact.status, mutateDocuments]);

  const { mutate } = useSWRConfig();
  const [isContentDirty, setIsContentDirty] = useState(false);

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!artifact) return;

      // In prototype mode, provide enhanced feedback and mock version creation
      if (prototypeMode) {
        // Simulate saving process
        setTimeout(() => {
          setIsContentDirty(false);
          setArtifact(currentArtifact => ({
            ...currentArtifact,
            content: updatedContent,
          }));

          // Create new mock version if content has significantly changed
          if (Math.abs(updatedContent.length - artifact.content.length) > 50) {
            // In a real app, this would create a new document version
            // Mock version creation logic would go here
          }
        }, 1000); // Simulate network delay
        return;
      }

      mutate<Array<Document>>(
        `/api/document?id=${artifact.documentId}`,
        async currentDocuments => {
          if (!currentDocuments) return undefined;

          const currentDocument = currentDocuments.at(-1);

          if (!currentDocument || !currentDocument.content) {
            setIsContentDirty(false);
            return currentDocuments;
          }

          if (currentDocument.content !== updatedContent) {
            await fetch(`/api/document?id=${artifact.documentId}`, {
              method: 'POST',
              body: JSON.stringify({
                title: artifact.title,
                content: updatedContent,
                kind: artifact.kind,
              }),
            });

            setIsContentDirty(false);

            const newDocument = {
              ...currentDocument,
              content: updatedContent,
              createdAt: new Date(),
            };

            return [...currentDocuments, newDocument];
          }
          return currentDocuments;
        },
        { revalidate: false },
      );
    },
    [artifact, mutate, prototypeMode, setArtifact],
  );

  const debouncedHandleContentChange = useDebouncedCallback(handleContentChange, 2000);

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      if (document && updatedContent !== document.content) {
        setIsContentDirty(true);
        setSaveStatus('saving');

        if (debounce) {
          debouncedHandleContentChange(updatedContent);
        } else {
          handleContentChange(updatedContent);
        }

        // Update save status after content change
        setTimeout(
          () => {
            setSaveStatus('saved');
            setLastSavedTime(new Date());

            // Reset status after showing success
            setTimeout(() => {
              setSaveStatus('idle');
            }, 2000);
          },
          debounce ? 2000 : 1000,
        );
      }
    },
    [document, debouncedHandleContentChange, handleContentChange],
  );

  function getDocumentContentById(index: number) {
    const docsToUse = prototypeMode ? mockDocuments : documents;
    if (!docsToUse) return '';
    if (!docsToUse[index]) return '';
    return docsToUse[index].content ?? '';
  }

  const handleVersionChange = (type: 'next' | 'prev' | 'toggle' | 'latest') => {
    const docsToUse = prototypeMode ? mockDocuments : documents;
    if (!docsToUse) return;

    if (type === 'latest') {
      setCurrentVersionIndex(docsToUse.length - 1);
      setMode('edit');
    }

    if (type === 'toggle') {
      setMode(mode => (mode === 'edit' ? 'diff' : 'edit'));
    }

    if (type === 'prev') {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex(index => index - 1);
      }
    } else if (type === 'next') {
      if (currentVersionIndex < docsToUse.length - 1) {
        setCurrentVersionIndex(index => index + 1);
      }
    }
  };

  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  /*
   * NOTE: if there are no documents, or if
   * the documents are being fetched, then
   * we mark it as the current version.
   */

  const docsForVersionCheck = prototypeMode ? mockDocuments : documents;
  const isCurrentVersion =
    docsForVersionCheck && docsForVersionCheck.length > 0
      ? currentVersionIndex === docsForVersionCheck.length - 1
      : true;

  const { width: windowWidth, height: windowHeight } = useViewportSize();
  const isMobile = windowWidth ? windowWidth < APPLE_BREAKPOINTS.IPAD_MINI : false;
  const isTablet = windowWidth
    ? windowWidth >= APPLE_BREAKPOINTS.IPAD_MINI &&
      windowWidth < APPLE_BREAKPOINTS.IPAD_PRO_12_LANDSCAPE
    : false;

  const artifactDefinition = artifactDefinitions.find(
    definition => definition.kind === artifact.kind,
  );

  if (!artifactDefinition) {
    throw new Error('Artifact definition not found!');
  }

  useEffect(() => {
    if (artifact.documentId !== 'init') {
      if (artifactDefinition.initialize) {
        artifactDefinition.initialize({
          documentId: artifact.documentId,
          setMetadata,
        });
      }
    }
  }, [artifact.documentId, artifactDefinition, setMetadata]);

  return (
    <AnimatePresence>
      {artifact.isVisible && (
        <motion.div
          data-testid="artifact"
          className={`fixed left-0 top-0 z-[${Z_INDEX.MODAL}] flex h-dvh w-dvw flex-row bg-transparent`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.4 } }}
        >
          {!isMobile && (
            <motion.div
              className="fixed h-dvh bg-background"
              initial={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
              animate={{ width: windowWidth, right: 0 }}
              exit={{
                width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                right: 0,
              }}
            />
          )}

          {!isMobile && (
            <motion.div
              className={cn(
                'relative h-dvh shrink-0 bg-muted dark:bg-background',
                // Responsive sidebar width
                isTablet ? 'w-[320px]' : 'w-[400px]',
              )}
              initial={{ opacity: 0, x: 10, scale: 1 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                },
              }}
              exit={{
                opacity: 0,
                x: 0,
                scale: 1,
                transition: { duration: 0 },
              }}
            >
              <AnimatePresence>
                {!isCurrentVersion && (
                  <motion.div
                    className={`absolute left-0 top-0 z-[${Z_INDEX.PANEL}] h-dvh w-[400px] bg-zinc-900/50`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>

              <div className="flex h-full flex-col items-center justify-between">
                <ArtifactMessages
                  chatId={chatId}
                  status={status}
                  votes={votes}
                  messages={messages}
                  setMessages={setMessages}
                  reload={reload}
                  isReadonly={isReadonly}
                  artifactStatus={artifact.status}
                />

                <form className="relative flex w-full flex-row items-end gap-2 px-4 pb-4">
                  <MultimodalInput
                    chatId={chatId}
                    input={input}
                    setInput={setInput}
                    status={status}
                    stop={stop}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    messages={messages}
                    append={append}
                    className="bg-background dark:bg-muted"
                    setMessages={setMessages}
                    selectedVisibilityType={selectedVisibilityType}
                  />
                </form>
              </div>
            </motion.div>
          )}

          <motion.div
            className="fixed flex h-dvh flex-col overflow-y-scroll border-zinc-200 bg-background dark:border-zinc-700 dark:bg-muted md:border-l"
            initial={
              isMobile
                ? {
                    opacity: 1,
                    x: artifact.boundingBox.left,
                    y: artifact.boundingBox.top,
                    height: artifact.boundingBox.height,
                    width: artifact.boundingBox.width,
                    borderRadius: 50,
                  }
                : {
                    opacity: 1,
                    x: artifact.boundingBox.left,
                    y: artifact.boundingBox.top,
                    height: artifact.boundingBox.height,
                    width: artifact.boundingBox.width,
                    borderRadius: 50,
                  }
            }
            animate={
              isMobile
                ? {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth ? windowWidth : 'calc(100dvw)',
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
                : {
                    opacity: 1,
                    x: isTablet ? 320 : 400,
                    y: 0,
                    height: windowHeight,
                    width: windowWidth
                      ? windowWidth - (isTablet ? 320 : 400)
                      : `calc(100dvw-${isTablet ? 320 : 400}px)`,
                    borderRadius: 0,
                    transition: {
                      delay: 0,
                      type: 'spring',
                      stiffness: 200,
                      damping: 30,
                      duration: 5000,
                    },
                  }
            }
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: {
                delay: 0.1,
                type: 'spring',
                stiffness: 600,
                damping: 30,
              },
            }}
          >
            <div className="flex flex-row items-start justify-between p-2">
              <div className="flex flex-row items-start gap-4">
                <ArtifactCloseButton />

                <div className="flex flex-col">
                  <div className="font-medium">{artifact.title}</div>

                  {/* Enhanced Status Display */}
                  <div className="flex items-center gap-2">
                    {saveStatus === 'saving' || isContentDirty ? (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-sm text-blue-600"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-3 w-3 rounded-full border border-blue-600 border-t-transparent"
                        />
                        <span>Saving changes...</span>
                      </motion.div>
                    ) : saveStatus === 'saved' ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 text-sm text-green-600"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={SPRING.BOUNCY}
                          className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500"
                        >
                          <div className="h-1 w-1 rounded-full bg-white" />
                        </motion.div>
                        <span>Changes saved</span>
                      </motion.div>
                    ) : document ? (
                      <div className="text-sm text-muted-foreground">
                        {`Updated ${formatDistance(new Date(document.createdAt), new Date(), {
                          addSuffix: true,
                        })}`}
                      </div>
                    ) : (
                      <div className="mt-2 h-3 w-32 animate-pulse rounded-md bg-muted-foreground/20" />
                    )}

                    {/* Version Indicator for Prototype Mode */}
                    {prototypeMode && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        v{currentVersionIndex + 1}.{mockDocuments.length}
                      </motion.div>
                    )}
                  </div>

                  {/* Last Saved Indicator */}
                  {lastSavedTime && saveStatus === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-xs text-muted-foreground"
                    >
                      Last saved {formatDistance(lastSavedTime, new Date(), { addSuffix: true })}
                    </motion.div>
                  )}
                </div>
              </div>

              <ArtifactActions
                artifact={artifact}
                currentVersionIndex={currentVersionIndex}
                handleVersionChange={handleVersionChange}
                isCurrentVersion={isCurrentVersion}
                mode={mode}
                metadata={metadata}
                setMetadata={setMetadata}
              />
            </div>

            <div className="h-full !max-w-full items-center overflow-y-scroll bg-background dark:bg-muted">
              <artifactDefinition.content
                title={artifact.title}
                content={
                  isCurrentVersion ? artifact.content : getDocumentContentById(currentVersionIndex)
                }
                mode={mode}
                status={artifact.status}
                currentVersionIndex={currentVersionIndex}
                suggestions={[]}
                onSaveContent={saveContent}
                isInline={false}
                isCurrentVersion={isCurrentVersion}
                getDocumentContentById={getDocumentContentById}
                isLoading={isDocumentsFetching && !artifact.content}
                metadata={metadata}
                setMetadata={setMetadata}
              />

              <AnimatePresence>
                {isCurrentVersion && (
                  <Toolbar
                    isToolbarVisible={isToolbarVisible}
                    setIsToolbarVisible={setIsToolbarVisible}
                    append={append}
                    status={status}
                    stop={stop}
                    setMessages={setMessages}
                    artifactKind={artifact.kind}
                  />
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {!isCurrentVersion && (
                <VersionFooter
                  currentVersionIndex={currentVersionIndex}
                  documents={prototypeMode ? mockDocuments : documents}
                  handleVersionChange={handleVersionChange}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Artifact = memo(PureArtifact, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.input !== nextProps.input) return false;
  // Fixed: Compare messages array properly, not messages vs length
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;

  return true;
});
