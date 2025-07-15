'use client';

import { Button } from '#/components/ui/button';
import { useAnimationSystem } from '#/hooks/ui/use-framer-motion';
import { isPrototypeMode } from '#/lib/prototype-mode';
import type { Attachment } from '#/lib/types';
import { APPLE_BREAKPOINTS, BACKDROP_STYLES } from '#/lib/ui-constants';
import { useInterval, useViewportSize } from '@mantine/hooks';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Download,
  Eye,
  File,
  FileImage,
  FileText,
  Loader2,
  Music,
  Video,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Props for the PreviewAttachment component
 */
interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
  showActions?: boolean;
}

/**
 * Preview attachment component with upload progress and actions
 * @param attachment - Attachment data to preview
 * @param isUploading - Whether the attachment is currently uploading
 * @param onRemove - Callback to remove the attachment
 * @param showActions - Whether to show action buttons
 */
export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
  showActions = true,
}: PreviewAttachmentProps) => {
  const { variants, performance } = useAnimationSystem();
  const { name, url, contentType } = attachment;
  const prototypeMode = isPrototypeMode();
  const { width: windowWidth } = useViewportSize();
  const _isMobile = windowWidth < APPLE_BREAKPOINTS.IPAD_MINI;

  // Enhanced state for prototype mode
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'uploading' | 'success' | 'error' | 'processing'
  >('uploading');
  const [isHovered, setIsHovered] = useState(false);
  const [fileSize, setFileSize] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>(url);

  // Use Mantine's useInterval for better performance and cleanup
  const uploadProgressInterval = useInterval(() => {
    setUploadProgress(prev => {
      const next = prev + Math.random() * 15;
      if (next >= 100) {
        uploadProgressInterval.stop();
        setUploadStatus('processing');

        // Simulate processing phase
        setTimeout(() => {
          setUploadStatus('success');
          toast.success(`${name} uploaded successfully`);
        }, 1000);

        return 100;
      }
      return next;
    });
  }, 200);

  // Simulate upload progress in prototype mode
  useEffect(() => {
    if (isUploading && prototypeMode) {
      setUploadStatus('uploading');
      setUploadProgress(0);
      uploadProgressInterval.start();
    } else {
      uploadProgressInterval.stop();
    }
  }, [isUploading, prototypeMode, uploadProgressInterval]);

  // Generate mock file size and preview for prototype mode
  useEffect(() => {
    if (prototypeMode && !fileSize) {
      const sizes = ['1.2 MB', '3.5 MB', '847 KB', '12.1 MB', '456 KB'];
      setFileSize(sizes[Math.floor(Math.random() * sizes.length)]);

      // Generate mock preview URL for non-images
      if (!contentType?.startsWith('image') && !url) {
        setPreviewUrl(`/mock-files/${name}`);
      }
    }
  }, [prototypeMode, fileSize, contentType, url, name]);

  // Get file type icon
  const getFileIcon = () => {
    if (!contentType) return File;

    if (contentType.startsWith('image')) return FileImage;
    if (contentType.startsWith('video')) return Video;
    if (contentType.startsWith('audio')) return Music;
    if (contentType.includes('pdf') || contentType.includes('text')) return FileText;
    if (contentType.includes('zip') || contentType.includes('archive')) return Archive;

    return File;
  };

  const FileIcon = getFileIcon();

  // Handle file actions
  const handlePreview = () => {
    if (prototypeMode) {
      toast.success(`Opening preview for ${name}`);
      // In real app, this would open a preview modal
    } else {
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    if (prototypeMode) {
      toast.success(`Downloading ${name}...`);
      // Simulate download
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = name || 'download';
      link.click();
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      if (prototypeMode) {
        toast.success(`Removed ${name}`);
      }
    }
  };

  return (
    <motion.div
      data-testid="input-attachment-preview"
      variants={variants.bounceScaleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative flex flex-col gap-2"
      onHoverStart={() => {
        performance.batchUpdates([() => setIsHovered(true)]);
      }}
      onHoverEnd={() => {
        performance.batchUpdates([() => setIsHovered(false)]);
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Enhanced Main Preview Container */}
      <motion.div
        className={cx(
          'relative flex aspect-video h-20 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed',
          'bg-gradient-to-br from-muted/50 to-muted',
        )}
        animate={{
          borderColor:
            uploadStatus === 'success'
              ? '#16a34a'
              : uploadStatus === 'error'
                ? '#dc2626'
                : isUploading
                  ? '#3b82f6'
                  : isHovered
                    ? 'hsl(var(--ring) / 0.5)'
                    : 'hsl(var(--border))',
          backgroundColor:
            uploadStatus === 'success'
              ? '#f0fdf4'
              : uploadStatus === 'error'
                ? '#fef2f2'
                : isUploading
                  ? '#eff6ff'
                  : isHovered
                    ? 'hsl(var(--muted) / 0.8)'
                    : 'hsl(var(--muted) / 0.5)',
          scale: isHovered && !isUploading ? 1.02 : 1,
          transition: { duration: performance.optimizedDuration(0.2) },
        }}
        whileHover={
          !isUploading
            ? {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: { duration: performance.optimizedDuration(0.15) },
              }
            : {}
        }
        style={{ willChange: 'transform, border-color, background-color, box-shadow' }}
      >
        {/* File Content */}
        {contentType?.startsWith('image') && previewUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: uploadStatus === 'success' || !isUploading ? 1 : 0.5 }}
            key={previewUrl}
            className="size-full"
          >
            <Image
              src={previewUrl}
              alt={name ?? 'An image attachment'}
              width={200}
              height={200}
              sizes="200px"
              className="size-full rounded-md object-cover"
              onError={() => {
                if (prototypeMode) {
                  // Fallback to placeholder in prototype mode
                  setPreviewUrl('');
                }
              }}
            />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 p-2">
            <motion.div
              animate={{
                color: uploadStatus === 'success' ? '#16a34a' : 'hsl(var(--muted-foreground))',
                scale: isHovered ? 1.1 : 1,
                transition: { duration: performance.optimizedDuration(0.2) },
              }}
              style={{ willChange: 'transform, color' }}
            >
              <FileIcon className="h-6 w-6" />
            </motion.div>
            {prototypeMode && fileSize && (
              <span className="font-mono text-xs text-muted-foreground">{fileSize}</span>
            )}
          </div>
        )}

        {/* Enhanced Upload Status Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              variants={variants.overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`absolute inset-0 flex flex-col items-center justify-center ${BACKDROP_STYLES.LIGHT} rounded-md`}
              style={{ willChange: 'opacity' }}
            >
              <AnimatePresence mode="wait">
                {uploadStatus === 'uploading' && (
                  <motion.div
                    className="flex flex-col items-center gap-1"
                    variants={variants.scaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: performance.optimizedDuration(1),
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{ willChange: 'transform' }}
                    >
                      <Loader2 className="h-4 w-4 text-blue-500" />
                    </motion.div>
                    {prototypeMode && (
                      <motion.div
                        className="font-mono text-xs text-blue-600"
                        key={Math.floor(uploadProgress / 10)}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: performance.optimizedDuration(0.3) }}
                      >
                        {Math.round(uploadProgress)}%
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {uploadStatus === 'processing' && (
                  <motion.div
                    className="flex flex-col items-center gap-1"
                    variants={variants.bounceScaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: performance.optimizedDuration(2),
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{ willChange: 'transform' }}
                    >
                      <Loader2 className="h-4 w-4 text-purple-500" />
                    </motion.div>
                    <motion.div
                      className="text-xs text-purple-600"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: performance.optimizedDuration(1.5),
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ willChange: 'opacity' }}
                    >
                      Processing
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {uploadStatus === 'success' && (
                  <motion.div
                    variants={variants.bounceScaleVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: performance.optimizedDuration(0.6),
                        ease: 'easeOut',
                      }}
                      style={{ willChange: 'transform' }}
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {uploadStatus === 'error' && (
                  <motion.div
                    variants={variants.shakeVariants}
                    initial="rest"
                    animate="shake"
                    exit="rest"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Progress Bar for Prototype Mode */}
        <AnimatePresence>
          {isUploading && prototypeMode && uploadStatus === 'uploading' && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-md bg-muted"
              variants={variants.slideUpVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{
                  type: performance.isHighPerformanceDevice ? 'spring' : 'tween',
                  stiffness: performance.isHighPerformanceDevice ? 200 : undefined,
                  damping: performance.isHighPerformanceDevice ? 20 : undefined,
                  duration: performance.isHighPerformanceDevice
                    ? undefined
                    : performance.optimizedDuration(0.3),
                }}
                className="h-full bg-blue-500"
                style={{ willChange: 'width' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Action Buttons Overlay */}
        <AnimatePresence>
          {isHovered && !isUploading && showActions && (
            <motion.div
              variants={variants.overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`absolute inset-0 flex items-center justify-center gap-1 ${BACKDROP_STYLES.LIGHT} rounded-md`}
              style={{ willChange: 'opacity' }}
            >
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                onClick={handlePreview}
                title="Preview file"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-6 w-6"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="h-3 w-3" />
              </Button>
              {onRemove && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6"
                  onClick={handleRemove}
                  title="Remove file"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Remove Button */}
        {onRemove && !isUploading && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={handleRemove}
            className={cx(
              'absolute -right-2 -top-2 z-10',
              'h-5 w-5 rounded-full bg-red-500 text-white',
              'flex items-center justify-center',
              'transition-all duration-200 ease-out',
              'hover:scale-110 hover:bg-red-600',
              'focus:outline-none focus:ring-2 focus:ring-red-300',
            )}
            title="Remove file"
          >
            <X className="h-3 w-3" />
          </motion.button>
        )}
      </motion.div>

      {/* Enhanced File Name and Details */}
      <motion.div
        className="space-y-1"
        variants={variants.staggerContainerFast}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="max-w-24 truncate text-xs"
          animate={{
            color:
              uploadStatus === 'success'
                ? '#15803d'
                : isHovered
                  ? 'hsl(var(--foreground))'
                  : 'hsl(var(--muted-foreground))',
            transition: { duration: performance.optimizedDuration(0.2) },
          }}
          variants={variants.slideUpVariants}
          style={{ willChange: 'color' }}
        >
          {name}
        </motion.div>

        {prototypeMode && fileSize && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-xs text-muted-foreground"
          >
            {fileSize}
          </motion.div>
        )}

        {uploadStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 dark:text-red-400"
          >
            Upload failed
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
