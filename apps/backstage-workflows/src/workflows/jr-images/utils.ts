// JR-Images Utility Functions
// Non-async utility functions separated from server actions

import { generateJrImageR2Key } from '@/workflows/jr-images/config';
import { FirestoreDocument, ProcessingPriority } from './types';

/**
 * Categorizes documents by priority for JR-Images processing
 */
export function categorizeJrImageDocumentsByPriority(documents: FirestoreDocument[]): {
  highPriority: FirestoreDocument[];
  mediumPriority: FirestoreDocument[];
  lowPriority: FirestoreDocument[];
} {
  const highPriority: FirestoreDocument[] = [];
  const mediumPriority: FirestoreDocument[] = [];
  const lowPriority: FirestoreDocument[] = [];

  documents.forEach((doc) => {
    const isHighPriority =
      doc.priority === 'high' ||
      doc.imageTypes?.includes('hero') ||
      doc.productTitle.toLowerCase().includes('bestseller') ||
      doc.productTitle.toLowerCase().includes('featured');

    const isMediumPriority = doc.priority === 'medium' || doc.imageTypes?.includes('gallery');

    if (isHighPriority) {
      highPriority.push(doc);
    } else if (isMediumPriority) {
      mediumPriority.push(doc);
    } else {
      lowPriority.push(doc);
    }
  });

  return { highPriority, mediumPriority, lowPriority };
}

/**
 * Generates R2 key for JR-Images processing
 */
export function generateJrImageKey(
  documentId: string,
  imageIndex: number,
  originalUrl: string,
  priority: ProcessingPriority = 'low',
): string {
  return generateJrImageR2Key(documentId, imageIndex, originalUrl, priority);
}
