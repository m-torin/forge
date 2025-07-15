import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod/v4';

import { auth } from '#/app/(auth)/auth';
import { logError } from '@repo/observability';

// Allowed file extensions for security
const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp', // Images
  'pdf',
  'txt',
  'md',
  'doc',
  'docx',
  'csv',
  'json',
  'html',
  'rtf', // Documents
] as const;

// Maximum file name length to prevent path traversal
const MAX_FILENAME_LENGTH = 255;

// Enhanced schema to support both regular files and RAG documents
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine(file => file.size <= 50 * 1024 * 1024, {
      // Increased to 50MB for documents
      message: 'File size should be less than 50MB',
    })
    .refine(
      file => {
        const allowedTypes = [
          // Images (existing)
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          // Documents for RAG
          'application/pdf',
          'text/plain',
          'text/markdown',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/csv',
          'application/json',
          'text/html',
          'application/rtf',
        ];
        return allowedTypes.includes(file.type);
      },
      {
        message: 'File type not supported. Allowed: images, PDF, text, markdown, Word documents',
      },
    ),
});

const RAGUploadSchema = z.object({
  file: FileSchema.shape.file,
  purpose: z.enum(['chat', 'rag']).default('chat'),
  title: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  isPublic: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const purpose = (formData.get('purpose') as string) || 'chat';
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate based on purpose
    const validationSchema = purpose === 'rag' ? RAGUploadSchema : FileSchema;
    const validatedData = validationSchema.safeParse({
      file,
      purpose,
      title,
      category,
      tags,
      isPublic,
    });

    if (!validatedData.success) {
      const errorMessage = validatedData.error.issues.map((error: any) => error.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const originalFilename = (formData.get('file') as File).name;

    // Security validations for filename
    if (!originalFilename || originalFilename.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json({ error: 'Invalid filename length' }, { status: 400 });
    }

    // Sanitize filename to prevent path traversal attacks
    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, ''); // Remove trailing dots

    if (!sanitizedFilename) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const fileExtension = sanitizedFilename.split('.').pop()?.toLowerCase();

    // Validate file extension
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension as any)) {
      return NextResponse.json(
        {
          error: `File extension not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const safeUserId = session.user?.id?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'anonymous';

    // Create organized file path based on purpose with sanitized components
    const filepath =
      purpose === 'rag'
        ? `rag-documents/${safeUserId}/${timestamp}-${sanitizedFilename}`
        : `uploads/${safeUserId}/${timestamp}-${sanitizedFilename}`;

    const fileBuffer = await file.arrayBuffer();

    try {
      // Upload to Vercel Blob with enhanced options
      const blob = await put(filepath, fileBuffer, {
        access: 'public',
        multipart: file.size > 5 * 1024 * 1024, // Use multipart for files > 5MB
      });

      // Prepare response based on purpose
      const response = {
        ...blob,
        originalFilename,
        fileExtension,
        purpose,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user?.id,
        ...(purpose === 'rag' && {
          title: title || originalFilename.replace(`.${fileExtension}`, ''),
          category: category || 'uncategorized',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          isPublic,
          metadata: {
            uploadedAt: new Date().toISOString(),
            userId: session.user?.id,
            originalFilename,
            fileSize: file.size,
            mimeType: file.type,
          },
        }),
      };

      // For RAG documents, trigger processing pipeline
      if (purpose === 'rag') {
        try {
          // Trigger document processing asynchronously
          const processingResponse = await fetch(
            `${request.url.split('/api')[0]}/api/documents/process`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Cookie: request.headers.get('Cookie') || '',
              },
              body: JSON.stringify({
                title: response.title,
                originalFilename,
                fileSize: file.size,
                mimeType: file.type,
                category: response.category,
                tags: response.tags,
                isPublic: response.isPublic,
                blobUrl: blob.url,
                blobKey: blob.pathname,
              }),
            },
          );

          if (processingResponse.ok) {
            const processingResult = await processingResponse.json();
            (response as any).processingStatus = 'completed';
            (response as any).processingMessage = 'Document processed and indexed successfully';
            (response as any).documentId = processingResult.documentId;
            (response as any).chunksCreated = processingResult.chunksCreated;
          } else {
            (response as any).processingStatus = 'failed';
            (response as any).processingMessage = 'Document upload succeeded but processing failed';
          }
        } catch (processingError) {
          await logError('Document processing failed', { error: processingError });
          (response as any).processingStatus = 'failed';
          (response as any).processingMessage = 'Document upload succeeded but processing failed';
        }
      }

      return NextResponse.json(response);
    } catch (error) {
      await logError('Upload failed', { error });
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    await logError('Failed to process request', { error });
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
