import { createImageUpload } from '@repo/editing';
import { toast } from 'sonner';

class LocalUploadFallbackError extends Error {
  constructor(
    public readonly file: File,
    message: string,
  ) {
    super(message);
    this.name = 'LocalUploadFallbackError';
  }
}

const preloadImage = (url: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to preload uploaded image.'));
    image.src = url;
  });

const onUpload = async (file: File): Promise<string | File> => {
  const responsePromise = fetch('/api/upload', {
    method: 'POST',
    headers: {
      'content-type': file?.type || 'application/octet-stream',
      'x-vercel-filename': file?.name || 'image.png',
    },
    body: file,
  });

  const uploadPromise = (async () => {
    const res = await responsePromise;

    if (res.status === 200) {
      const { url } = (await res.json()) as { url: string };
      await preloadImage(url);
      return url;
    }

    if (res.status === 401) {
      throw new LocalUploadFallbackError(
        file,
        '`BLOB_READ_WRITE_TOKEN` environment variable not found, reading image locally instead.',
      );
    }

    throw new Error('Error uploading image. Please try again.');
  })();

  try {
    const result = await toast.promise(uploadPromise, {
      loading: 'Uploading image...',
      success: 'Image uploaded successfully.',
      error: error => (error as Error).message,
    });
    return result as string;
  } catch (error) {
    if (error instanceof LocalUploadFallbackError) {
      return error.file;
    }

    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: file => {
    if (!file.type.includes('image/')) {
      toast.error('File type not supported.');
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error('File size too big (max 20MB).');
      return false;
    }
    return true;
  },
});
