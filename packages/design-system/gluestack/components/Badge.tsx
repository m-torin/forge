import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  secondary: 'bg-gray-200 text-gray-700',
  destructive: 'bg-red-100 text-red-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <View
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      <Text className={cn(
        'font-medium',
        badgeVariants[variant].split(' ')[1], // Extract text color class
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base'
      )}>
        {children}
      </Text>
    </View>
  );
}

export type { BadgeProps };