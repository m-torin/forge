import type { Editor } from '@tiptap/core';

export interface MediaUploadOptions {
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Allowed file types */
  allowedTypes?: string[];
  /** Upload URL endpoint */
  uploadUrl?: string;
  /** Custom upload handler */
  onUpload?: (file: File) => Promise<string>;
  /** Progress callback */
  onProgress?: (progress: number) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

export interface MediaUploadResult {
  /** Uploaded file URL */
  url: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
}

/**
 * Validate file for upload
 *
 * @param file - File to validate
 * @param options - Upload options
 * @throws Error if validation fails
 */
function validateFile(file: File, options: MediaUploadOptions): void {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options; // 10MB default

  if (maxSize && file.size > maxSize) {
    throw new Error(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
    );
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }
}

/**
 * Convert file to base64 data URL
 *
 * @param file - File to convert
 * @returns Promise resolving to data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload file to server
 *
 * @param file - File to upload
 * @param options - Upload options
 * @returns Promise resolving to upload result
 *
 * @example
 * ```ts
 * const result = await uploadFile(file, {
 *   uploadUrl: 'https://api.example.com/upload',
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   onProgress: (progress) => console.log(`${progress}%`)
 * });
 * console.log('Uploaded:', result.url);
 * ```
 */
export async function uploadFile(
  file: File,
  options: MediaUploadOptions = {},
): Promise<MediaUploadResult> {
  validateFile(file, options);

  // Use custom upload handler if provided
  if (options.onUpload) {
    try {
      const url = await options.onUpload(file);
      return {
        url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      options.onError?.(err);
      throw err;
    }
  }

  // Use default upload to server
  if (!options.uploadUrl) {
    throw new Error('No upload URL or custom handler provided');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(options.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      url: data.url,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Upload failed');
    options.onError?.(err);
    throw err;
  }
}

/**
 * Create image upload handler for editor
 *
 * @param editor - TipTap editor instance
 * @param options - Upload options
 * @returns File input change handler
 *
 * @example
 * ```tsx
 * const handleImageUpload = createImageUploadHandler(editor, {
 *   uploadUrl: 'https://api.example.com/upload',
 *   onProgress: (progress) => setUploadProgress(progress)
 * });
 *
 * <input type="file" accept="image/*" onChange={handleImageUpload} />
 * ```
 */
export function createImageUploadHandler(editor: Editor, options: MediaUploadOptions = {}) {
  return async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // If no upload handler, use data URL
      if (!options.onUpload && !options.uploadUrl) {
        const dataUrl = await fileToDataUrl(file);
        editor.chain().focus().setImage({ src: dataUrl }).run();
      } else {
        const result = await uploadFile(file, options);
        editor.chain().focus().setImage({ src: result.url }).run();
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      options.onError?.(error as Error);
    }

    // Reset input
    event.target.value = '';
  };
}

/**
 * Handle image paste from clipboard
 *
 * @param editor - TipTap editor instance
 * @param options - Upload options
 * @returns Paste event handler
 *
 * @example
 * ```tsx
 * const handlePaste = createImagePasteHandler(editor, {
 *   uploadUrl: 'https://api.example.com/upload'
 * });
 *
 * useEffect(() => {
 *   document.addEventListener('paste', handlePaste);
 *   return () => document.removeEventListener('paste', handlePaste);
 * }, []);
 * ```
 */
export function createImagePasteHandler(editor: Editor, options: MediaUploadOptions = {}) {
  return async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();

        const file = item.getAsFile();
        if (!file) continue;

        try {
          // If no upload handler, use data URL
          if (!options.onUpload && !options.uploadUrl) {
            const dataUrl = await fileToDataUrl(file);
            editor.chain().focus().setImage({ src: dataUrl }).run();
          } else {
            const result = await uploadFile(file, options);
            editor.chain().focus().setImage({ src: result.url }).run();
          }
        } catch (error) {
          console.error('Image paste failed:', error);
          options.onError?.(error as Error);
        }

        break;
      }
    }
  };
}

/**
 * Handle image drop
 *
 * @param editor - TipTap editor instance
 * @param options - Upload options
 * @returns Drop event handler
 *
 * @example
 * ```tsx
 * const handleDrop = createImageDropHandler(editor, {
 *   uploadUrl: 'https://api.example.com/upload'
 * });
 *
 * <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
 *   <EditorContent editor={editor} />
 * </div>
 * ```
 */
export function createImageDropHandler(editor: Editor, options: MediaUploadOptions = {}) {
  return async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        // If no upload handler, use data URL
        if (!options.onUpload && !options.uploadUrl) {
          const dataUrl = await fileToDataUrl(file);
          editor.chain().focus().setImage({ src: dataUrl }).run();
        } else {
          const result = await uploadFile(file, options);
          editor.chain().focus().setImage({ src: result.url }).run();
        }
      } catch (error) {
        console.error('Image drop failed:', error);
        options.onError?.(error as Error);
      }
    }
  };
}

/**
 * Get image dimensions
 *
 * @param url - Image URL
 * @returns Promise resolving to dimensions
 */
export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Compress image file
 *
 * @param file - Image file to compress
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Promise resolving to compressed file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * TipTap editorProps-compatible image paste handler
 * For use with editorProps.handlePaste
 *
 * @param uploadFn - Upload function
 * @returns Handler for editorProps
 *
 * @example
 * ```tsx
 * <EditorContent
 *   editorProps={{
 *     handlePaste: handleImagePaste(uploadFn)
 *   }}
 * />
 * ```
 */
export function handleImagePaste(uploadFn: (file: File, view: any, pos: number) => void) {
  return (view: any, event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return false;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const { state } = view;
          const pos = state.selection.from;
          uploadFn(file, view, pos);
        }
        return true;
      }
    }
    return false;
  };
}

/**
 * TipTap editorProps-compatible image drop handler
 * For use with editorProps.handleDrop
 *
 * @param uploadFn - Upload function
 * @returns Handler for editorProps
 *
 * @example
 * ```tsx
 * <EditorContent
 *   editorProps={{
 *     handleDrop: handleImageDrop(uploadFn)
 *   }}
 * />
 * ```
 */
export function handleImageDrop(uploadFn: (file: File, view: any, pos: number) => void) {
  return (view: any, event: DragEvent, _slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files.length) {
      event.preventDefault();
      const [file] = Array.from(event.dataTransfer.files);
      const coordinates = view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      // deduct 1 from the pos or else the image will create an extra node
      if (file) uploadFn(file, view, coordinates?.pos ?? 0 - 1);
      return true;
    }
    return false;
  };
}

/**
 * Upload function type for image uploads
 */
export type UploadFn = (file: File, view: any, pos: number) => void;

/**
 * Options for creating image upload handler
 */
export interface ImageUploadOptions {
  /** Validation function for files */
  validateFn?: (file: File) => boolean | void;
  /** Upload handler that returns the URL or file */
  onUpload: (file: File) => Promise<string | File>;
}

/**
 * Create image upload handler with placeholder support
 * This is a backward-compatible implementation for @repo/ai-novel migration
 *
 * @param options - Upload options
 * @returns Upload function for use with handleImagePaste/handleImageDrop
 *
 * @example
 * ```tsx
 * const uploadFn = createImageUpload({
 *   onUpload: async (file) => {
 *     const url = await uploadToServer(file);
 *     return url;
 *   },
 *   validateFn: (file) => {
 *     if (file.size > 20 * 1024 * 1024) {
 *       toast.error('File too large');
 *       return false;
 *     }
 *     return true;
 *   }
 * });
 * ```
 */
export const createImageUpload = ({ validateFn, onUpload }: ImageUploadOptions): UploadFn => {
  return (file, view, pos) => {
    // Validate file
    const validated = validateFn?.(file);
    if (validated === false) return;

    // Create placeholder
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Insert placeholder image immediately
      const dataUrl = reader.result as string;
      const { schema } = view.state;
      const node = schema.nodes.image?.create({ src: dataUrl });

      if (node) {
        const tr = view.state.tr.insert(pos, node);
        view.dispatch(tr);
      }
    };

    // Upload and replace with final URL
    (async () => {
      try {
        const result = await onUpload(file);
        const imageSrc = typeof result === 'string' ? result : reader.result;

        // Find and replace the placeholder
        // Note: In a production implementation, you'd want to track the placeholder position
        // For now, this simplified version just inserts at the original position
        const { schema } = view.state;
        const node = schema.nodes.image?.create({ src: imageSrc });

        if (node) {
          // This is a simplified version - a full implementation would use
          // a ProseMirror plugin to track the placeholder and replace it accurately
          const tr = view.state.tr.replaceWith(pos, pos, node);
          view.dispatch(tr);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        // In case of error, you might want to remove the placeholder
      }
    })();
  };
};
