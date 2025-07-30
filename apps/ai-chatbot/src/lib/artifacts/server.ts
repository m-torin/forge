import { codeDocumentHandler } from '#/artifacts/code/server';
import { imageDocumentHandler } from '#/artifacts/image/server';
import { sheetDocumentHandler } from '#/artifacts/sheet/server';
import { textDocumentHandler } from '#/artifacts/text/server';
import type { ArtifactKind } from '#/components/artifact';
import { saveDocument } from '#/lib/db/queries';
import type { Document } from '#/lib/db/schema';
import type { Session } from 'next-auth';

/**
 * Props for saving a document to the database
 */
export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}

/**
 * Props for creating a new document callback
 */
export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  session: Session;
}

/**
 * Props for updating an existing document callback
 */
export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  session: Session;
}

/**
 * Interface for document handlers with artifact kind constraint
 */
export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

/**
 * Factory function to create document handlers for different artifact types
 * @param config - Configuration object with kind and callback functions
 * @returns Document handler with create and update functionality
 */
export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.id,
          title: args.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
      }

      return;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          id: args.document.id,
          title: args.document.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
      }

      return;
    },
  };
}

/**
 * Array of document handlers for each artifact kind
 * Used to define the available document types and their handlers
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
];

/**
 * Available artifact kinds as const array
 */
export const artifactKinds = ['text', 'code', 'image', 'sheet'] as const;
