import { memo } from 'react';

import type { ArtifactKind } from '#/components/artifact';
import { FileIcon, LoaderIcon, MessageIcon, PencilEditIcon } from '#/components/icons';
import { useArtifact } from '#/hooks/use-artifact';
import { toast } from 'sonner';

/**
 * Gets action text based on document operation type and tense
 * @param type - Type of document operation
 * @param tense - Present or past tense
 * @returns Action text string or null
 */
const getActionText = (
  type: 'create' | 'update' | 'request-suggestions',
  tense: 'present' | 'past',
) => {
  switch (type) {
    case 'create':
      return tense === 'present' ? 'Creating' : 'Created';
    case 'update':
      return tense === 'present' ? 'Updating' : 'Updated';
    case 'request-suggestions':
      return tense === 'present' ? 'Adding suggestions' : 'Added suggestions to';
    default:
      return null;
  }
};

/**
 * Props for document tool result component
 */
interface DocumentToolResultProps {
  type: 'create' | 'update' | 'request-suggestions';
  result: { id: string; title: string; kind: ArtifactKind };
  isReadonly: boolean;
}

/**
 * Pure document tool result component
 * @param type - Document operation type
 * @param result - Document result data
 * @param isReadonly - Whether in read-only mode
 */
function PureDocumentToolResult({ type, result, isReadonly }: DocumentToolResultProps) {
  const { setArtifact } = useArtifact();

  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl border bg-background px-3 py-2"
      onClick={event => {
        if (isReadonly) {
          toast.error('Viewing files in shared chats is currently not supported.');
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setArtifact({
          documentId: result.id,
          kind: result.kind,
          content: '',
          title: result.title,
          isVisible: true,
          status: 'idle',
          boundingBox,
        });
      }}
    >
      <div className="mt-1 text-muted-foreground">
        {type === 'create' ? (
          <FileIcon />
        ) : type === 'update' ? (
          <PencilEditIcon />
        ) : type === 'request-suggestions' ? (
          <MessageIcon />
        ) : null}
      </div>
      <div className="text-left">{`${getActionText(type, 'past')} "${result.title}"`}</div>
    </button>
  );
}

/**
 * Memoized document tool result component
 */
export const DocumentToolResult = memo(PureDocumentToolResult, () => true);

/**
 * Props for document tool call component
 */
interface DocumentToolCallProps {
  type: 'create' | 'update' | 'request-suggestions';
  args:
    | { title: string; kind: ArtifactKind } // for create
    | { id: string; description: string } // for update
    | { documentId: string }; // for request-suggestions
  isReadonly: boolean;
}

/**
 * Pure document tool call component for ongoing operations
 * @param type - Document operation type
 * @param args - Operation arguments
 * @param isReadonly - Whether in read-only mode
 */
function PureDocumentToolCall({ type, args, isReadonly }: DocumentToolCallProps) {
  const { setArtifact } = useArtifact();

  return (
    <button
      type="button"
      className="cursor pointer flex w-fit flex-row items-start justify-between gap-3 rounded-xl border px-3 py-2"
      onClick={event => {
        if (isReadonly) {
          toast.error('Viewing files in shared chats is currently not supported.');
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setArtifact(currentArtifact => ({
          ...currentArtifact,
          isVisible: true,
          boundingBox,
        }));
      }}
    >
      <div className="flex flex-row items-start gap-3">
        <div className="mt-1 text-zinc-500">
          {type === 'create' ? (
            <FileIcon />
          ) : type === 'update' ? (
            <PencilEditIcon />
          ) : type === 'request-suggestions' ? (
            <MessageIcon />
          ) : null}
        </div>

        <div className="text-left">
          {`${getActionText(type, 'present')} ${
            type === 'create' && 'title' in args && args.title
              ? `"${args.title}"`
              : type === 'update' && 'description' in args
                ? `"${args.description}"`
                : type === 'request-suggestions'
                  ? 'for document'
                  : ''
          }`}
        </div>
      </div>

      <div className="mt-1 animate-spin">
        <LoaderIcon />
      </div>
    </button>
  );
}

/**
 * Memoized document tool call component
 */
export const DocumentToolCall = memo(PureDocumentToolCall, () => true);
