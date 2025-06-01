import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  action?: {
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
  className?: string;
}

const toastVariants = {
  default: 'bg-white border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

const toastIcons = {
  default: '📝',
  destructive: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

export function Toast({
  title,
  description,
  variant = 'default',
  action,
  onClose,
  className,
}: ToastProps) {
  return (
    <View
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
        toastVariants[variant],
        className
      )}
    >
      <View className="p-4">
        <View className="flex-row items-start">
          <View className="flex-shrink-0">
            <Text className="text-lg">{toastIcons[variant]}</Text>
          </View>
          
          <View className="ml-3 w-0 flex-1">
            {title && (
              <Text className="text-sm font-medium">
                {title}
              </Text>
            )}
            {description && (
              <Text className={cn(
                'text-sm opacity-90',
                title && 'mt-1'
              )}>
                {description}
              </Text>
            )}
          </View>
          
          <View className="ml-4 flex-shrink-0 flex">
            {action && (
              <Pressable
                onPress={action.onPress}
                className="mr-2"
              >
                <Text className="text-sm font-medium text-blue-600">
                  {action.label}
                </Text>
              </Pressable>
            )}
            
            {onClose && (
              <Pressable onPress={onClose}>
                <Text className="text-gray-400 text-lg">×</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export type { ToastProps };