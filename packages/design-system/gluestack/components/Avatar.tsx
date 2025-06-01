import React from 'react';
import { View, Text, Image } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'rounded' | 'square';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
};

const avatarTextSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const avatarVariants = {
  circle: 'rounded-full',
  rounded: 'rounded-md',
  square: 'rounded-none',
};

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  variant = 'circle',
  className,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      return alt
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return '?';
  };

  return (
    <View
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden bg-gray-100',
        avatarSizes[size],
        avatarVariants[variant],
        className
      )}
    >
      {src && !imageError ? (
        <Image
          source={{ uri: src }}
          alt={alt}
          onError={handleImageError}
          className={cn(
            'w-full h-full object-cover',
            avatarVariants[variant]
          )}
        />
      ) : (
        <Text
          className={cn(
            'font-medium text-gray-600 select-none',
            avatarTextSizes[size]
          )}
        >
          {getFallbackText()}
        </Text>
      )}
    </View>
  );
}

export type { AvatarProps };