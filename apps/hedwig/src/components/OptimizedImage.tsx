import { Image, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OptimizedImageProps extends ImageProps {
  blurhash?: string;
  fallbackSource?: string;
  showLoadingIndicator?: boolean;
}

// Common blurhashes for placeholders
export const BLURHASHES = {
  AVATAR: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
  BARCODE: 'L6PZfSi_.AyE]~RBt7R**0o#xuwH',
  DEFAULT: 'L6Pj0^i_.AyE_3t7t7R**0o#DgR4',
  ERROR: 'L6Pj0^i_.AyEp0dt7R**0o#DgR4',
  LANDSCAPE: 'LGF5?xYk^6#M@-5c,1J5@[or[Q6.',
  PRODUCT: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
};

export default function OptimizedImage({
  blurhash = BLURHASHES.DEFAULT,
  cachePolicy = 'memory-disk',
  contentFit = 'cover',
  fallbackSource,
  showLoadingIndicator = false,
  source,
  style,
  transition = 200,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Determine final source
  const finalSource = error && fallbackSource ? fallbackSource : source;

  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        cachePolicy={cachePolicy}
        contentFit={contentFit}
        onError={handleError}
        onLoad={handleLoad}
        placeholder={blurhash}
        source={finalSource}
        transition={transition}
        style={[styles.image, style]}
      />
      
      {showLoadingIndicator && loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      
      {error && !fallbackSource && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🖼️</Text>
          <Text style={styles.errorText}>Failed to load</Text>
        </View>
      )}
    </View>
  );
}

// Product-specific image component
export function ProductImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      cachePolicy="memory-disk"
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fallbackSource={require('../../assets/placeholder-product.png')}
      priority="high"
      blurhash={BLURHASHES.PRODUCT}
    />
  );
}

// Barcode scan result image
export function BarcodeImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      contentFit="contain"
      transition={100}
      blurhash={BLURHASHES.BARCODE}
    />
  );
}

// User avatar image
export function AvatarImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      cachePolicy="memory"
      contentFit="cover"
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      fallbackSource={require('../../assets/default-avatar.png')}
      blurhash={BLURHASHES.AVATAR}
    />
  );
}

// Thumbnail image for lists
export function ThumbnailImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      cachePolicy="memory"
      priority="low"
      transition={0} // No animation for thumbnails
    />
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  errorText: {
    color: '#999',
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 12,
  },
});

// Export utility functions for expo-image
export { Image as ExpoImage } from 'expo-image';

// Helper to preload images
export async function preloadImages(urls: string[]): Promise<void> {
  try {
    await Image.prefetch(urls);
  } catch (error) {
    console.warn('Failed to preload images:', error);
  }
}

// Helper to clear image cache
export async function clearImageCache(): Promise<void> {
  try {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
}