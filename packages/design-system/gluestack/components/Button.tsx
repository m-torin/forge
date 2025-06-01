import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: 'bg-blue-600 border-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-600 border-gray-600 active:bg-gray-700',
  outline: 'bg-transparent border-gray-300 active:bg-gray-50',
  ghost: 'bg-transparent border-transparent active:bg-gray-100',
  destructive: 'bg-red-600 border-red-600 active:bg-red-700',
};

const buttonTextVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-gray-700',
  ghost: 'text-gray-700',
  destructive: 'text-white',
};

const buttonSizes = {
  xs: 'px-2 py-1',
  sm: 'px-3 py-2',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3',
  xl: 'px-8 py-4',
};

const buttonTextSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  className,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'border rounded-md flex-row items-center justify-center',
        buttonVariants[variant],
        buttonSizes[size],
        isDisabled && 'opacity-50',
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#374151' : '#ffffff'} 
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            className={cn(
              'font-medium text-center',
              buttonTextVariants[variant],
              buttonTextSizes[size],
              leftIcon && 'ml-2',
              rightIcon && 'mr-2'
            )}
          >
            {children}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </Pressable>
  );
}

export type { ButtonProps };