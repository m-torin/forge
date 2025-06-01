import React from 'react';
import { View } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const cardVariants = {
  default: 'bg-white border border-gray-200',
  outlined: 'bg-transparent border border-gray-300',
  elevated: 'bg-white shadow-lg',
  filled: 'bg-gray-50 border border-gray-100',
};

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg',
        cardVariants[variant],
        className
      )}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <View className={cn('p-4 pb-2', className)}>
      {children}
    </View>
  );
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <View className={cn('p-4', className)}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <View className={cn('p-4 pt-2', className)}>
      {children}
    </View>
  );
}

export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps };