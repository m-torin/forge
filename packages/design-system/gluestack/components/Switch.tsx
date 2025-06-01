import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const switchSizes = {
  sm: {
    track: 'w-9 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className,
}: SwitchProps) {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const sizeConfig = switchSizes[size];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        'flex-row items-center gap-3',
        disabled && 'opacity-50',
        className
      )}
    >
      <View
        className={cn(
          'relative inline-flex items-center rounded-full border-2 border-transparent transition-colors',
          sizeConfig.track,
          checked ? 'bg-blue-600' : 'bg-gray-200',
          disabled && 'opacity-50'
        )}
      >
        <View
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
            sizeConfig.thumb,
            checked ? sizeConfig.translate : 'translate-x-0'
          )}
        />
      </View>

      {(label || description) && (
        <View className="flex-1">
          {label && (
            <Text
              className={cn(
                'font-medium text-gray-900',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg'
              )}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text className="text-sm text-gray-600 mt-1">
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

export type { SwitchProps };