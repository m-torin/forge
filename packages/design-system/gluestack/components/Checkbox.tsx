import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive';
  className?: string;
}

const checkboxSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const checkboxVariants = {
  default: {
    unchecked: 'border-gray-300 bg-white',
    checked: 'border-blue-600 bg-blue-600',
  },
  destructive: {
    unchecked: 'border-gray-300 bg-white',
    checked: 'border-red-600 bg-red-600',
  },
};

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = 'md',
  variant = 'default',
  className,
}: CheckboxProps) {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        'flex-row items-start gap-3',
        disabled && 'opacity-50',
        className
      )}
    >
      <View
        className={cn(
          'border-2 rounded flex items-center justify-center',
          checkboxSizes[size],
          checked
            ? checkboxVariants[variant].checked
            : checkboxVariants[variant].unchecked,
          disabled && 'opacity-50'
        )}
      >
        {checked && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
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

export type { CheckboxProps };