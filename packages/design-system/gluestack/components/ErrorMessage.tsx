import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import { Button } from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'destructive' | 'warning' | 'info';
  className?: string;
}

const errorVariants = {
  destructive: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

const textVariants = {
  destructive: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
};

const titleVariants = {
  destructive: 'text-red-800',
  warning: 'text-yellow-800',
  info: 'text-blue-800',
};

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'destructive',
  className,
}: ErrorMessageProps) {
  return (
    <View
      className={cn(
        'border rounded-lg p-4 m-4',
        errorVariants[variant],
        className
      )}
    >
      <Text
        className={cn(
          'font-semibold text-base mb-1',
          titleVariants[variant]
        )}
      >
        {title}
      </Text>
      <Text
        className={cn(
          'text-sm mb-3',
          textVariants[variant]
        )}
      >
        {message}
      </Text>
      {(onRetry || onDismiss) && (
        <View className="flex-row gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              className="flex-1"
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onPress={onDismiss}
              className="flex-1"
            >
              Dismiss
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

export type { ErrorMessageProps };