import type { ViewStyle, TextStyle } from 'react-native';

export interface BaseComponentProps {
  className?: string;
  style?: ViewStyle;
}

export interface BaseTextProps {
  className?: string;
  style?: TextStyle;
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
export type ColorScheme = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ColorMode = 'light' | 'dark';

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Common prop types that can be used across components
export interface CommonProps {
  size?: Size;
  variant?: Variant;
  colorScheme?: ColorScheme;
  isDisabled?: boolean;
  isLoading?: boolean;
}

// Layout props
export interface LayoutProps {
  padding?: ResponsiveValue<number>;
  margin?: ResponsiveValue<number>;
  width?: ResponsiveValue<number | string>;
  height?: ResponsiveValue<number | string>;
  flex?: ResponsiveValue<number>;
}