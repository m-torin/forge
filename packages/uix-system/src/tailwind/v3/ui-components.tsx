/**
 * UI Components Abstraction Layer
 *
 * This file provides type definitions and default implementations for UI components
 * that can be customized per application while maintaining component compatibility.
 */

import React, { ReactNode, createContext, useContext } from 'react';

// Base UI component type definitions
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  asChild?: boolean;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'secondary';
}

export interface CardProps extends BaseComponentProps {}
export interface CardHeaderProps extends BaseComponentProps {}
export interface CardContentProps extends BaseComponentProps {}
export interface CardTitleProps extends BaseComponentProps {}

export interface TooltipProps extends BaseComponentProps {}
export interface TooltipTriggerProps extends BaseComponentProps {
  asChild?: boolean;
}
export interface TooltipContentProps extends BaseComponentProps {}

// UI Components interface - to be implemented by consuming applications
export interface UIComponents {
  Button: React.ComponentType<ButtonProps>;
  Badge: React.ComponentType<BadgeProps>;
  Card: React.ComponentType<CardProps>;
  CardHeader: React.ComponentType<CardHeaderProps>;
  CardContent: React.ComponentType<CardContentProps>;
  CardTitle: React.ComponentType<CardTitleProps>;
  Tooltip: React.ComponentType<TooltipProps>;
  TooltipTrigger: React.ComponentType<TooltipTriggerProps>;
  TooltipContent: React.ComponentType<TooltipContentProps>;
}

// Default minimal implementations (fallbacks)
const defaultButton: React.FC<ButtonProps> = ({ children, className, onClick, ...props }) => (
  <button className={className} onClick={onClick} {...props}>
    {children}
  </button>
);

const defaultBadge: React.FC<BadgeProps> = ({ children, className, ...props }) => (
  <span className={className} {...props}>
    {children}
  </span>
);

const defaultCard: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const defaultTooltip: React.FC<TooltipProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const defaultTooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

const defaultTooltipContent: React.FC<TooltipContentProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={className} {...props}>
    {children}
  </div>
);

// Default UI components implementation
export const defaultUIComponents: UIComponents = {
  Button: defaultButton,
  Badge: defaultBadge,
  Card: defaultCard,
  CardHeader: defaultCard,
  CardContent: defaultCard,
  CardTitle: defaultCard,
  Tooltip: defaultTooltip,
  TooltipTrigger: defaultTooltipTrigger,
  TooltipContent: defaultTooltipContent,
};

const UIComponentsContext = createContext<UIComponents>(defaultUIComponents);

export const UIComponentsProvider: React.FC<{
  components: Partial<UIComponents>;
  children: ReactNode;
}> = ({ components, children }) => {
  const mergedComponents = { ...defaultUIComponents, ...components };
  return (
    <UIComponentsContext.Provider value={mergedComponents}>{children}</UIComponentsContext.Provider>
  );
};

export const useUIComponents = () => useContext(UIComponentsContext);
