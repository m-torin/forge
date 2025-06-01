import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
  multiline?: boolean;
  numberOfLines?: number;
  variant?: 'default' | 'outlined' | 'filled' | 'unstyled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const inputVariants = {
  default: 'border border-gray-300 bg-white',
  outlined: 'border-2 border-gray-300 bg-transparent',
  filled: 'border border-gray-200 bg-gray-50',
  unstyled: 'border-0 bg-transparent',
};

const inputSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  className,
  multiline = false,
  numberOfLines = 1,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      )}
      
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className={cn(
            'rounded-md',
            inputVariants[variant],
            inputSizes[size],
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
            'text-gray-900 placeholder:text-gray-500',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            multiline && 'text-top',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
        />
        
        {rightIcon && (
          <View className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-red-600 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}

export type { InputProps };