'use client';

import { useDisclosure, useFileDialog, useFocusTrap, useHotkeys, useId } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconLoader2,
  IconMusic,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { clsx } from 'clsx';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MediaType } from '../../utils/media-upload-handler';
import { getMediaType } from '../../utils/media-upload-handler';
import {
  DEFAULT_SECURE_CONFIG,
  validateFile as secureValidateFile,
} from '../../utils/secure-media-upload';

export interface MediaUploadOptions {
  accept?: string;
  maxSize?: number;
  maxSizes?: {
    image?: number;
    video?: number;
    audio?: number;
  };
  limit?: number;
  upload?: (
    file: File,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal,
  ) => Promise<string>;
  onError?: (error: Error) => void;
  onSuccess?: (url: string, mediaType: MediaType) => void;
}

export interface MediaUploadProps extends MediaUploadOptions {
  node: any;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
  editor: any;
  _editor?: any;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  url: string | null;
  mediaType: MediaType;
}

/**
 * Get appropriate icon for media type
 */
function getMediaIcon(mediaType: MediaType, size: number = 32) {
  switch (mediaType) {
    case 'video':
      return <IconVideo size={size} className="text-gray-400" />;
    case 'audio':
      return <IconMusic size={size} className="text-gray-400" />;
    case 'image':
    default:
      return <IconPhoto size={size} className="text-gray-400" />;
  }
}

/**
 * Get appropriate upload text for media type
 */
function getUploadText(mediaType: MediaType): string {
  switch (mediaType) {
    case 'video':
      return 'Drop a video here or click to browse';
    case 'audio':
      return 'Drop an audio file here or click to browse';
    case 'image':
    default:
      return 'Drop an image here or click to browse';
  }
}

/**
 * Media preview component for successful uploads
 */
function MediaPreview({
  url,
  mediaType,
  alt,
  onDelete,
  showConfirmDialog,
  onConfirmDelete,
  onCancelDelete,
}: {
  url: string;
  mediaType: MediaType;
  alt?: string;
  onDelete: () => void;
  showConfirmDialog?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // Focus trap for confirmation dialog
  const focusTrapRef = useFocusTrap(showConfirmDialog || false);

  const togglePlayback = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleMediaEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  switch (mediaType) {
    case 'image':
      return (
        <div className="media-upload-node group relative inline-block">
          <img
            src={url}
            alt={alt || ''}
            className="h-auto max-w-full rounded-lg"
            style={{ maxHeight: '500px' }}
          />
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onDelete}
              className="rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              title="Delete media"
            >
              <IconTrash size={14} />
            </button>
          </div>
          {showConfirmDialog && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-image-dialog-title"
            >
              <div
                ref={focusTrapRef}
                className="rounded-lg bg-white p-4 shadow-lg"
                role="alertdialog"
              >
                <p id="delete-image-dialog-title" className="mb-3 text-sm text-gray-800">
                  Delete this image?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onConfirmDelete}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  >
                    Delete
                  </button>
                  <button
                    onClick={onCancelDelete}
                    className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'video':
      return (
        <div className="media-upload-node group relative inline-block">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            className="h-auto max-w-full rounded-lg"
            style={{ maxHeight: '500px' }}
            controls
            onEnded={handleMediaEnded}
          />
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onDelete}
              className="rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              title="Delete media"
            >
              <IconTrash size={14} />
            </button>
          </div>
          {showConfirmDialog && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-video-dialog-title"
            >
              <div
                ref={focusTrapRef}
                className="rounded-lg bg-white p-4 shadow-lg"
                role="alertdialog"
              >
                <p id="delete-video-dialog-title" className="mb-3 text-sm text-gray-800">
                  Delete this video?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onConfirmDelete}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  >
                    Delete
                  </button>
                  <button
                    onClick={onCancelDelete}
                    className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="media-upload-node group relative inline-block min-w-80 rounded-lg bg-gray-100 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
            >
              {isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            </button>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Audio File</div>
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                src={url}
                className="mt-2 w-full"
                controls
                onEnded={handleMediaEnded}
              />
            </div>
            <button
              onClick={onDelete}
              className="rounded-full bg-red-500 p-1 text-white opacity-0 transition-colors transition-opacity hover:bg-red-600 group-hover:opacity-100"
              title="Delete media"
            >
              <IconTrash size={14} />
            </button>
          </div>
          {showConfirmDialog && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-audio-dialog-title"
            >
              <div
                ref={focusTrapRef}
                className="rounded-lg bg-white p-4 shadow-lg"
                role="alertdialog"
              >
                <p id="delete-audio-dialog-title" className="mb-3 text-sm text-gray-800">
                  Delete this audio file?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onConfirmDelete}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  >
                    Delete
                  </button>
                  <button
                    onClick={onCancelDelete}
                    className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

const MediaUploadComponent = forwardRef<any, MediaUploadProps>(
  (
    {
      node,
      updateAttributes,
      deleteNode,
      _editor,
      accept = 'image/*,video/*,audio/*',
      maxSize,
      maxSizes = {},
      limit = 1,
      upload,
      onError,
      onSuccess,
    },
    ref,
  ) => {
    const abortControllerRef = useRef<AbortController | null>(null);
    const [uploadState, setUploadState] = useState<UploadState>({
      uploading: false,
      progress: 0,
      error: null,
      url: node.attrs.src || null,
      mediaType: node.attrs.mediaType || 'image',
    });

    const [dragOver, setDragOver] = useState(false);

    // Use Mantine's useDisclosure for delete confirmation
    const [confirmDelete, { open: openConfirmDelete, close: closeConfirmDelete }] =
      useDisclosure(false);

    // Accessibility improvements
    const uploadAreaId = useId();
    const progressId = useId();
    const errorId = useId();
    const descriptionId = useId();

    // Focus trap for confirmation dialog
    const _focusTrapRef = useFocusTrap(confirmDelete);

    // Keyboard shortcuts for accessibility
    useHotkeys([
      [
        'Escape',
        () => {
          if (confirmDelete) {
            closeConfirmDelete();
          } else if (uploadState.uploading) {
            handleCancel();
          }
        },
      ],
      [
        'Enter',
        () => {
          if (!uploadState.uploading && !uploadState.error && !uploadState.url) {
            fileDialog.open();
          }
        },
      ],
    ]);

    const handleError = useCallback(
      (error: Error) => {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: error.message,
        }));
        if (onError) {
          onError(error);
        }
      },
      [onError],
    );

    const handleSuccess = useCallback(
      (url: string, mediaType: MediaType) => {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          progress: 100,
          url,
          error: null,
          mediaType,
        }));
        updateAttributes({ src: url, mediaType });
        if (onSuccess) {
          onSuccess(url, mediaType);
        }
      },
      [updateAttributes, onSuccess],
    );

    const validateFile = useCallback(
      async (file: File): Promise<string | null> => {
        // Use secure binary-based validation instead of MIME header validation
        const allowedTypes = accept.split(',').map(type => type.trim());

        // Create secure config from component props
        const secureConfig = {
          allowedTypes: allowedTypes.length > 0 ? allowedTypes : DEFAULT_SECURE_CONFIG.allowedTypes,
          maxSize: maxSize || DEFAULT_SECURE_CONFIG.maxSize,
          maxSizes: {
            image: maxSizes?.image || DEFAULT_SECURE_CONFIG.maxSizes?.image || 10 * 1024 * 1024,
            video: maxSizes?.video || DEFAULT_SECURE_CONFIG.maxSizes?.video || 100 * 1024 * 1024,
            audio: maxSizes?.audio || DEFAULT_SECURE_CONFIG.maxSizes?.audio || 50 * 1024 * 1024,
          },
        };

        try {
          const validation = await secureValidateFile(file, secureConfig);

          if (!validation.valid) {
            return validation.error || 'File validation failed';
          }

          return null;
        } catch (error) {
          return error instanceof Error ? error.message : 'File validation failed';
        }
      },
      [accept, maxSize, maxSizes],
    );

    // Enhanced file upload handler with better error handling
    const handleFileUpload = useCallback(
      async (file: File) => {
        if (!upload) {
          handleError(new Error('No upload handler provided'));
          return;
        }

        const validationError = await validateFile(file);
        if (validationError) {
          handleError(new Error(validationError));
          return;
        }

        const mediaType = getMediaType(file.type);

        // Cancel any existing upload
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setUploadState(prev => ({
          ...prev,
          uploading: true,
          progress: 0,
          error: null,
          mediaType,
        }));

        try {
          const url = await upload(
            file,
            progress => {
              setUploadState(prev => ({
                ...prev,
                progress: Math.min(progress, 99), // Don't reach 100% until success
              }));
            },
            abortControllerRef.current.signal,
          );

          if (url) {
            handleSuccess(url, mediaType);
          } else {
            handleError(new Error('Upload failed: No URL returned'));
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            handleError(error);
          }
        }
      },
      [upload, validateFile, handleError, handleSuccess],
    );

    // Forward declaration of handleFileSelection for useFileDialog
    const handleFileSelection = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        handleFileUpload(file);
      },
      [handleFileUpload],
    );

    // Use Mantine's useFileDialog for enhanced file selection
    const fileDialog = useFileDialog({
      multiple: limit > 1,
      accept,
      onChange: handleFileSelection,
      onCancel: () => {
        // Optional: Handle file selection cancellation
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        // Focus implementation if needed
      },
      openFileDialog: fileDialog.open,
    }));

    const handleFileSelect = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filesToUpload = Array.from(files).slice(0, limit);

        if (filesToUpload.length === 1) {
          handleFileUpload(filesToUpload[0]);
        } else {
          // For multiple files, upload the first one for now
          // In a more advanced implementation, you could handle multiple uploads
          handleFileUpload(filesToUpload[0]);
        }
      },
      [handleFileUpload, limit],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const files = e.dataTransfer.files;
        handleFileSelect(files);
      },
      [handleFileSelect],
    );

    const handleClick = useCallback(() => {
      if (uploadState.uploading) return;
      // Use Mantine's file dialog instead of native file input
      fileDialog.open();
    }, [uploadState.uploading, fileDialog]);

    const handleCancel = useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
      }));
    }, []);

    const handleDelete = useCallback(() => {
      if (uploadState.uploading) {
        handleCancel();
      }
      openConfirmDelete();
    }, [uploadState.uploading, handleCancel, openConfirmDelete]);

    const confirmDeleteAction = useCallback(() => {
      deleteNode();
      closeConfirmDelete();
    }, [deleteNode, closeConfirmDelete]);

    const handleRetry = useCallback(() => {
      // Re-open file dialog for retry
      fileDialog.open();
    }, [fileDialog]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    // If we have a successful upload, show the media
    if (uploadState.url && !uploadState.uploading && !uploadState.error) {
      return (
        <MediaPreview
          url={uploadState.url}
          mediaType={uploadState.mediaType}
          alt={node.attrs.alt}
          onDelete={handleDelete}
          showConfirmDialog={confirmDelete}
          onConfirmDelete={confirmDeleteAction}
          onCancelDelete={closeConfirmDelete}
        />
      );
    }

    return (
      <div className="media-upload-node not-prose">
        <div
          id={uploadAreaId}
          className={clsx(
            'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            uploadState.uploading && 'pointer-events-none',
          )}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${uploadState.mediaType} file - click or drag and drop`}
          aria-describedby={uploadState.error ? errorId : descriptionId}
          aria-busy={uploadState.uploading}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          {uploadState.uploading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <IconLoader2 size={32} className="animate-spin text-blue-500" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading {uploadState.mediaType}...</p>
                <div
                  className="h-2 w-full rounded-full bg-gray-200"
                  role="progressbar"
                  aria-valuenow={uploadState.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-describedby={progressId}
                >
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p id={progressId} className="text-xs text-gray-500" aria-live="polite">
                  {uploadState.progress}% complete
                </p>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="px-3 py-1 text-sm text-gray-600 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : uploadState.error ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <IconAlertCircle size={32} className="text-red-500" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-red-600">Upload failed</p>
                <p
                  id={errorId}
                  className="text-xs text-gray-500"
                  role="alert"
                  aria-live="assertive"
                >
                  {uploadState.error}
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleRetry();
                  }}
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                >
                  Retry
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="px-3 py-1 text-sm text-gray-600 transition-colors hover:text-gray-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <span aria-hidden="true">{getMediaIcon(uploadState.mediaType)}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <IconUpload size={16} className="mr-1 inline" aria-hidden="true" />
                  {getUploadText(uploadState.mediaType)}
                </p>
                <p id={descriptionId} className="text-xs text-gray-500">
                  Supports {accept}. Press Enter or Space to select files.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

MediaUploadComponent.displayName = 'MediaUploadComponent';

export const MediaUploadNode = Node.create<MediaUploadOptions>({
  name: 'mediaUpload',

  addOptions() {
    return {
      accept: 'image/*,video/*,audio/*',
      maxSize: undefined,
      maxSizes: {
        image: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024, // 100MB
        audio: 50 * 1024 * 1024, // 50MB
      },
      limit: 1,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
    };
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      mediaType: {
        default: 'image',
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="media-upload"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'media-upload' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaUploadComponent);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^!\[(.+|:?)]\((.+|:?)\)$/,
        type: this.type,
        getAttributes: match => {
          const [, alt, src] = match;
          return { src, alt, mediaType: 'image' };
        },
      }),
    ];
  },
});
