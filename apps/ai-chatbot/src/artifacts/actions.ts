'use server';

import { getSuggestionsByDocumentId } from '#/lib/db/queries';

/**
 * Server action to retrieve suggestions for a document
 * @param documentId - ID of the document to get suggestions for
 * @returns Array of suggestions or empty array if none found
 */
export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}
