import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  overlay?: boolean;
  progress?: number;
  className?: string;
}

export function Spinner({
  size = 'large',
  color = '#3b82f6',
  message,
  overlay = false,
  progress,
  className,
}: SpinnerProps) {
  const containerClasses = overlay
    ? 'absolute inset-0 bg-black/50 z-[1000] flex items-center justify-center p-5'
    : 'flex-1 items-center justify-center p-5';

  return (
    <View className={cn(containerClasses, className)}>
      <View className="bg-white rounded-xl p-6 items-center min-w-[150px] shadow-lg">
        <ActivityIndicator size={size} color={color} />

        {message && (
          <Text className="mt-4 text-base text-gray-600 text-center leading-6">
            {message}
          </Text>
        )}

        {typeof progress === 'number' && (
          <View className="mt-4 w-full items-center">
            <View className="w-full h-2 bg-gray-200 rounded overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </View>
            <Text className="mt-2 text-sm text-gray-600 font-semibold">
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export type { SpinnerProps };