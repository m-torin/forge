import { db } from '#/lib/db';
import { ragChunk, ragDocument } from '#/lib/db/schema';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { logError, logInfo } from '@repo/observability';
import { isRAGEnabled } from './tools/rag/rag-tools';

export interface DocumentProcessingResult {
  success: boolean;
  documentId?: string;
  chunksCreated?: number;
  error?: string;
  processingTime?: number;
}

export interface DocumentMetadata {
  title: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  blobUrl: string;
  blobKey: string;
}

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  metadata: {
    startChar?: number;
    endChar?: number;
    tokenCount?: number;
    keywords?: string[];
  };
}

/**
 * Extract text content from various file types
 */
export async function extractTextFromBlob(blobUrl: string, mimeType: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const buffer = await response.arrayBuffer();

    switch (mimeType) {
      case 'text/plain':
      case 'text/markdown':
      case 'text/html':
      case 'text/csv':
      case 'application/json':
        const decoder = new TextDecoder();
        return decoder.decode(buffer);

      case 'application/pdf':
        // For PDF processing, we would use a library like pdf-parse
        // For now, return a placeholder that would be replaced with actual PDF text extraction
        return extractPDFText(buffer);

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // For Word documents, we would use libraries like mammoth or docx-parser
        return extractWordText(buffer);

      case 'application/rtf':
        return extractRTFText(buffer);

      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    logError('Error extracting text from blob', error);
    throw error;
  }
}

/**
 * Extract text from PDF (placeholder implementation)
 */
async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  // This would typically use a library like pdf-parse or pdf2pic + OCR
  // For now, return a mock implementation
  const text = `[PDF Content Extracted]

This is a placeholder for PDF text extraction. In a real implementation,
this would use libraries like pdf-parse to extract text from PDF files.

The PDF contains ${Math.floor(buffer.byteLength / 1024)}KB of data that
would be processed to extract readable text content.`;

  return text;
}

/**
 * Extract text from Word documents (placeholder implementation)
 */
async function extractWordText(buffer: ArrayBuffer): Promise<string> {
  // This would typically use mammoth.js or similar
  const text = `[Word Document Content Extracted]

This is a placeholder for Word document text extraction. In a real implementation,
this would use libraries like mammoth.js to extract text from Word files.

The document contains ${Math.floor(buffer.byteLength / 1024)}KB of data.`;

  return text;
}

/**
 * Extract text from RTF documents (placeholder implementation)
 */
async function extractRTFText(buffer: ArrayBuffer): Promise<string> {
  // This would typically use rtf-parser or similar
  const decoder = new TextDecoder();
  const rtfContent = decoder.decode(buffer);

  // Basic RTF stripping (remove RTF control codes)
  // This is a very basic implementation - real RTF parsing would be more complex
  const text = rtfContent
    .replace(/\\[a-z]+[0-9]*\s?/gi, '') // Remove RTF control words
    .replace(/[{}]/g, '') // Remove braces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return text || '[RTF Content - Basic extraction]';
}

/**
 * Split text into chunks for RAG processing
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 200,
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let currentChunk = '';
  let currentStartChar = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '.';

    // If adding this sentence would exceed the chunk size, finalize current chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      const endChar = currentStartChar + currentChunk.length;

      chunks.push({
        content: currentChunk.trim(),
        chunkIndex,
        metadata: {
          startChar: currentStartChar,
          endChar,
          tokenCount: estimateTokenCount(currentChunk),
          keywords: extractKeywords(currentChunk),
        },
      });

      // Handle overlap
      const overlapText = getOverlapText(currentChunk, overlap);
      currentChunk = overlapText + ' ' + sentence;
      currentStartChar = endChar - overlapText.length;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add the final chunk if it has content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunkIndex,
      metadata: {
        startChar: currentStartChar,
        endChar: currentStartChar + currentChunk.length,
        tokenCount: estimateTokenCount(currentChunk),
        keywords: extractKeywords(currentChunk),
      },
    });
  }

  return chunks;
}

/**
 * Get overlap text from the end of a chunk
 */
function getOverlapText(text: string, overlapSize: number): string {
  if (text.length <= overlapSize) return text;

  // Try to find a good break point (sentence or word boundary)
  const endPortion = text.slice(-overlapSize);
  const lastSentence = endPortion.lastIndexOf('.');
  const lastWord = endPortion.lastIndexOf(' ');

  if (lastSentence > 0) {
    return text.slice(-(overlapSize - lastSentence));
  } else if (lastWord > 0) {
    return text.slice(-(overlapSize - lastWord));
  } else {
    return endPortion;
  }
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Extract basic keywords from text
 */
function extractKeywords(text: string): string[] {
  // Basic keyword extraction - remove common words and get significant terms
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Get unique words and return top 10 by frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Process a document for RAG integration
 */
export async function processDocumentForRAG(
  metadata: DocumentMetadata,
): Promise<DocumentProcessingResult> {
  const startTime = Date.now();

  try {
    // Handle demo mode
    if (shouldUseMockRAG()) {
      return processDocumentMock(metadata);
    }

    // Extract text from the uploaded file
    const extractedText = await extractTextFromBlob(metadata.blobUrl, metadata.mimeType);

    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: 'No text content could be extracted from the document',
      };
    }

    // Create document record in database
    const [documentRecord] = await db
      .insert(ragDocument)
      .values({
        title: metadata.title,
        content: extractedText,
        metadata: {
          source: 'user-upload',
          category: metadata.category || 'uncategorized',
          addedAt: new Date().toISOString(),
          userId: metadata.uploadedBy,
          tags: metadata.tags || [],
          originalFilename: metadata.originalFilename,
          fileType: metadata.mimeType,
        },
        userId: metadata.uploadedBy,
        isPublic: metadata.isPublic || false,
      })
      .returning();

    // Chunk the text
    const chunks = chunkText(extractedText);

    // Insert chunks into database
    const chunkPromises = chunks.map(async (chunk, index) => {
      return await db.insert(ragChunk).values({
        documentId: documentRecord.id,
        content: chunk.content,
        chunkIndex: index.toString(),
        metadata: chunk.metadata,
      });
    });

    await Promise.all(chunkPromises);

    // If real RAG is enabled, add to vector database
    if (isRAGEnabled()) {
      try {
        const { createRAGClient } = await import('./rag-client');
        const { env } = await import('#/root/env');

        // Create vector client
        const vectorClient = await createRAGClient({
          vectorUrl: env.UPSTASH_VECTOR_REST_URL as string,
          vectorToken: env.UPSTASH_VECTOR_REST_TOKEN as string,
          namespace: `user_${metadata.uploadedBy}`,
        });

        // Prepare chunks for vector insertion
        const vectorData = chunks.map((chunk, index) => ({
          id: `${documentRecord.id}_chunk_${index}`,
          content: chunk.content,
          metadata: {
            documentId: documentRecord.id,
            documentTitle: metadata.title,
            chunkIndex: index,
            category: metadata.category || 'uncategorized',
            tags: metadata.tags || [],
            userId: metadata.uploadedBy,
            ...chunk.metadata,
          },
        }));

        // Insert chunks into vector database
        const vectorResult = await vectorClient.upsert(vectorData);
        logInfo('Successfully inserted chunks into vector database', { count: vectorResult.count });
      } catch (vectorError) {
        logError('Failed to insert chunks into vector database', vectorError);
        // Don't fail the entire operation if vector insertion fails
        // The chunks are still saved in the database
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      documentId: documentRecord.id,
      chunksCreated: chunks.length,
      processingTime,
    };
  } catch (error) {
    logError('Error processing document for RAG', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Mock document processing for demo mode
 */
function processDocumentMock(metadata: DocumentMetadata): DocumentProcessingResult {
  try {
    // Add to mock knowledge base
    const mockContent = `Document: ${metadata.title}

This is mock content extracted from ${metadata.originalFilename}.
In demo mode, we simulate document processing and indexing.

File type: ${metadata.mimeType}
File size: ${Math.floor(metadata.fileSize / 1024)}KB
Category: ${metadata.category || 'uncategorized'}
Tags: ${metadata.tags?.join(', ') || 'none'}

This document has been processed and added to the mock knowledge base
for demonstration purposes.`;

    const _result = mockRAGKnowledgeBase.addDocument(mockContent, {
      title: metadata.title,
      source: 'user-upload',
      category: metadata.category || 'uncategorized',
      userId: metadata.uploadedBy,
      tags: metadata.tags,
      originalFilename: metadata.originalFilename,
      blobUrl: metadata.blobUrl,
    });

    // Simulate processing time
    const mockProcessingTime = Math.random() * 1000 + 500;

    return {
      success: true,
      documentId: `mock-${Date.now()}`,
      chunksCreated: Math.floor(mockContent.length / 500) + 1,
      processingTime: mockProcessingTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mock processing failed',
    };
  }
}

/**
 * Get document processing status
 */
export async function getDocumentProcessingStatus(documentId: string) {
  if (shouldUseMockRAG()) {
    return {
      status: 'completed',
      message: 'Mock document processed successfully',
    };
  }

  try {
    const document = await db.query.ragDocument.findFirst({
      where: (docs, { eq }) => eq(docs.id, documentId),
    });

    if (!document) {
      return {
        status: 'not_found',
        message: 'Document not found',
      };
    }

    return {
      status: 'completed',
      message: 'Document processed successfully',
      document,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
