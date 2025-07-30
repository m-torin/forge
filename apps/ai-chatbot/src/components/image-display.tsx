'use client';

import { DownloadIcon, ImageIcon, ShareIcon, ZoomInIcon } from '#/components/icons';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card';
import { cn } from '#/lib/utils';
import { logError } from '@repo/observability';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Props for ImageDisplay component
 */
interface ImageDisplayProps {
  type: 'single' | 'multiple' | 'diagram' | 'illustration' | 'variation';
  data: any;
  className?: string;
}

/**
 * Props for ImageCard component
 */
interface ImageCardProps {
  image: any;
  title?: string;
  metadata?: any;
  onImageClick: (url: string) => void;
  onDownload: (url: string) => void;
  onShare: (url: string) => void;
}

/**
 * Individual image card component with actions and metadata
 * @param image - Image data object
 * @param title - Image title
 * @param metadata - Image metadata
 * @param onImageClick - Click handler for image
 * @param onDownload - Download handler
 * @param onShare - Share handler
 */
function ImageCard({ image, title, metadata, onImageClick, onDownload, onShare }: ImageCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon size={16} />
          {title || 'Generated Image'}
          {metadata?.quality && (
            <Badge variant={metadata.quality === 'hd' ? 'default' : 'secondary'}>
              {metadata.quality.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="group relative">
          <Image
            src={image.url || image}
            alt={image.prompt || image.description || 'Generated image'}
            width={512}
            height={512}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="h-auto w-full cursor-pointer transition-transform duration-200 group-hover:scale-105"
            onClick={() => onImageClick(image.url || image)}
          />

          {/* Overlay with actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button variant="secondary" size="sm" onClick={() => onImageClick(image.url || image)}>
              <ZoomInIcon size={16} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onDownload(image.url || image)}>
              <DownloadIcon size={16} />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onShare(image.url || image)}>
              <ShareIcon size={16} />
            </Button>
          </div>
        </div>

        {/* Image details */}
        <div className="space-y-2 p-4">
          {image.prompt && (
            <div>
              <p className="text-sm font-medium">Prompt:</p>
              <p className="text-xs text-muted-foreground">{image.prompt}</p>
            </div>
          )}

          {image.revisedPrompt && image.revisedPrompt !== image.prompt && (
            <div>
              <p className="text-sm font-medium">Revised Prompt:</p>
              <p className="text-xs text-muted-foreground">{image.revisedPrompt}</p>
            </div>
          )}

          {metadata && (
            <div className="flex flex-wrap gap-1 pt-2">
              {metadata.size && (
                <Badge variant="outline" className="text-xs">
                  {metadata.size}
                </Badge>
              )}
              {metadata.style && (
                <Badge variant="outline" className="text-xs">
                  {metadata.style}
                </Badge>
              )}
              {metadata.model && (
                <Badge variant="outline" className="text-xs">
                  {metadata.model}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Component for displaying various types of generated images
 * @param type - Type of image display (single, multiple, diagram, etc.)
 * @param data - Image data object
 * @param className - Additional CSS classes
 */
export function ImageDisplay({ type, data, className }: ImageDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!data) return null;

  const containerAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      logError('Failed to download image', { error });
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Image',
          url: url,
        });
      } catch (error) {
        logError('Failed to share', { error });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
    }
  };

  if (type === 'single') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <ImageCard
          image={data.image || data}
          title="Generated Image"
          metadata={data.metadata}
          onImageClick={setSelectedImage}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        {/* Full-size modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedImage(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close image modal"
          >
            <div className="relative max-h-full max-w-4xl">
              <Image
                src={selectedImage}
                alt="Full size view"
                width={1024}
                height={1024}
                sizes="100vw"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'diagram') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <ImageCard
          image={data.diagram || data}
          title={`${data.type || 'Diagram'} - ${data.complexity || 'Standard'} Complexity`}
          metadata={data.metadata}
          onImageClick={setSelectedImage}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        {data.description && (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </CardContent>
          </Card>
        )}

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedImage(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close diagram modal"
          >
            <div className="relative max-h-full max-w-4xl">
              <Image
                src={selectedImage}
                width={1024}
                height={1024}
                sizes="100vw"
                alt="Full size diagram"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'illustration') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <ImageCard
          image={data.illustration || data}
          title={`${data.style || 'Illustration'} - ${data.mood || 'Professional'} Mood`}
          metadata={data.metadata}
          onImageClick={setSelectedImage}
          onDownload={handleDownload}
          onShare={handleShare}
        />

        {(data.subject || data.colors) && (
          <Card>
            <CardContent className="space-y-2 pt-4">
              {data.subject && (
                <div>
                  <p className="text-sm font-medium">Subject:</p>
                  <p className="text-sm text-muted-foreground">{data.subject}</p>
                </div>
              )}
              {data.colors && data.colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Color Palette:</p>
                  <div className="mt-1 flex gap-1">
                    {data.colors.map((color: string) => (
                      <Badge key={`color-${color}`} variant="outline" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedImage(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close illustration modal"
          >
            <div className="relative max-h-full max-w-4xl">
              <Image
                src={selectedImage}
                width={1024}
                height={1024}
                sizes="100vw"
                alt="Full size illustration"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'variation') {
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon size={16} />
              Image Variations - {data.variationType || 'Style'} Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.variations &&
                data.variations.map((variation: any, index: number) => (
                  <div key={`variation-${variation.url || index}`} className="group relative">
                    <Image
                      src={variation.url}
                      alt={`Variation ${index + 1}`}
                      width={256}
                      height={256}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="h-auto w-full cursor-pointer rounded-lg transition-transform duration-200 group-hover:scale-105"
                      onClick={() => setSelectedImage(variation.url)}
                    />

                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedImage(variation.url)}
                      >
                        <ZoomInIcon size={16} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(variation.url, `variation-${index + 1}.png`)}
                      >
                        <DownloadIcon size={16} />
                      </Button>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">{variation.prompt}</p>
                    </div>
                  </div>
                ))}
            </div>

            {data.originalPrompt && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm font-medium">Original Prompt:</p>
                <p className="text-sm text-muted-foreground">{data.originalPrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedImage(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close variation modal"
          >
            <div className="relative max-h-full max-w-4xl">
              <Image
                src={selectedImage}
                width={1024}
                height={1024}
                sizes="100vw"
                alt="Full size variation"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  if (type === 'multiple') {
    const images = Array.isArray(data) ? data : [data];
    return (
      <motion.div {...containerAnimation} className={cn('space-y-4', className)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {images.map((image: any, index: number) => (
            <ImageCard
              key={`image-${image.url || image.src || index}`}
              image={image}
              title={`Image ${index + 1}`}
              metadata={image.metadata}
              onImageClick={setSelectedImage}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ))}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setSelectedImage(null);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close multiple images modal"
          >
            <div className="relative max-h-full max-w-4xl">
              <Image
                src={selectedImage}
                alt="Full size view"
                width={1024}
                height={1024}
                sizes="100vw"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
}
