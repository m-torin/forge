import { artifactKinds, documentHandlersByArtifactKind } from '#/lib/artifacts/server';
import { generateUUID } from '#/lib/utils';
import { tool, type UIMessageStreamWriter } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod/v4';

/**
 * Props for creating a document tool
 */
interface CreateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter;
}

/**
 * Creates a document creation tool for AI agents
 * @param session - User session data
 * @param dataStream - Stream writer for real-time updates
 * @returns AI tool for document creation
 */
export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.write({
        type: 'data-kind',
        data: kind,
      });

      dataStream.write({
        type: 'data-id',
        data: id,
      });

      dataStream.write({
        type: 'data-title',
        data: title,
      });

      dataStream.write({
        type: 'data-clear',
        data: null,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        documentHandlerByArtifactKind => documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        session,
      });

      dataStream.write({ type: 'data-finish', data: null });

      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
