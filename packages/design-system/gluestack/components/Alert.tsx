import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@gluestack-ui/nativewind-utils/cn';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  className?: string;
}

export interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  default: 'bg-gray-50 border-gray-200 text-gray-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

export function Alert({
  children,
  variant = 'default',
  className,
}: AlertProps) {
  return (
    <View
      className={cn(
        'relative w-full rounded-lg border p-4',
        alertVariants[variant],
        className
      )}
    >
      {children}
    </View>
  );
}

export function AlertTitle({ children, className }: AlertTitleProps) {
  return (
    <Text
      className={cn(
        'mb-1 font-medium leading-none tracking-tight text-base',
        className
      )}
    >
      {children}
    </Text>
  );
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <Text
      className={cn(
        'text-sm opacity-90',
        className
      )}
    >
      {children}
    </Text>
  );
}

export type { AlertProps, AlertTitleProps, AlertDescriptionProps };