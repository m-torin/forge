'use client';

import { forwardRef } from 'react';

import { LikeButton, LikeSaveBtns } from '../../mantine-ciseco';

import type { ComponentType } from 'react';

// Define LikeButtonProps locally since it's not exported
interface LikeButtonProps {
  className?: string;
  liked?: boolean;
  onClick?: () => void;
}

/**
 * Context-aware component variants that can integrate with app-level contexts
 * These components accept render props or callbacks for context integration
 */

export interface ContextAwareLikeButtonProps extends Omit<LikeButtonProps, 'liked' | 'onClick'> {
  /**
   * Render prop for context integration
   * @param Component - The base LikeButton component
   * @returns The wrapped component with context
   */
  contextProvider?: (Component: ComponentType<LikeButtonProps>) => React.ReactElement;

  /**
   * Alternative: Direct props for simple cases
   */
  liked?: boolean;
  onClick?: () => void;

  price?: number;
  /**
   * Product metadata for analytics/tracking
   */
  productId?: string;
  productName?: string;
}

/**
 * Context-aware LikeButton that can integrate with any favorites context
 *
 * @example
 * ```tsx
 * // With render prop (recommended for complex contexts)
 * <ContextAwareLikeButton
 *   contextProvider={(Component) => (
 *     <GuestActionsConsumer>
 *       {({ favorites, toggleFavorite }) => (
 *         <Component
 *           liked={favorites.has(productId)}
 *           onClick={() => toggleFavorite(productId)}
 *         />
 *       )}
 *     </GuestActionsConsumer>
 *   )}
 * />
 *
 * // Or with direct props (for simple cases)
 * <ContextAwareLikeButton
 *   liked={isFavorite}
 *   onClick={handleToggle}
 * />
 * ```
 */
export const ContextAwareLikeButton = forwardRef<HTMLButtonElement, ContextAwareLikeButtonProps>(
  ({ contextProvider, liked, onClick, price, productId, productName, ...props }, ref) => {
    // If contextProvider is provided, use it
    if (contextProvider) {
      return contextProvider(LikeButton);
    }

    // Otherwise, use direct props
    return <LikeButton onClick={onClick} liked={liked} {...props} />;
  },
);

ContextAwareLikeButton.displayName = 'ContextAwareLikeButton';

export interface ContextAwareLikeSaveBtnsProps {
  /**
   * Context integration for favorites
   */
  favoriteContext?: {
    isFavorite: boolean;
    onToggleFavorite: () => void;
  };

  /**
   * Share functionality
   */
  onShare?: () => void;

  /**
   * Product metadata
   */
  productId?: string;
  productName?: string;

  className?: string;
}

/**
 * Context-aware LikeSaveBtns that can integrate with favorites and share contexts
 *
 * @example
 * ```tsx
 * <ContextAwareLikeSaveBtns
 *   favoriteContext={{
 *     isFavorite: favorites.has(productId),
 *     onToggleFavorite: () => toggleFavorite(productId)
 *   }}
 *   onShare={handleShare}
 *   productId={product.id}
 * />
 * ```
 */
export const ContextAwareLikeSaveBtns: React.FC<ContextAwareLikeSaveBtnsProps> = ({
  className,
  favoriteContext,
  onShare,
  productId,
  productName,
}) => {
  // If no context provided, render the base component with local state
  if (!favoriteContext) {
    return <LikeSaveBtns />;
  }

  const { isFavorite, onToggleFavorite } = favoriteContext;

  return (
    <div className={`flow-root ${className || ''}`}>
      <div className="flex text-neutral-700 dark:text-neutral-300 text-sm -mx-3 -my-1.5">
        <button
          onClick={onShare}
          className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          aria-label="Share"
        >
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="hidden sm:block ml-2">Share</span>
        </button>
        <button
          onClick={onToggleFavorite}
          className="py-1.5 px-3 flex rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isFavorite ? 'text-red-500' : ''}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="hidden sm:block ml-2">{isFavorite ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Higher-order component to make any component context-aware
 *
 * @example
 * ```tsx
 * const ContextAwareProductCard = withContextIntegration(ProductCard, {
 *   mapContextToProps: (context) => ({
 *     isLiked: context.favorites.has(product.id),
 *     onLike: () => context.toggleFavorite(product.id)
 *   })
 * });
 * ```
 */
export function withContextIntegration<P extends object>(
  Component: ComponentType<P>,
  options: {
    mapContextToProps: (context: any, props: P) => Partial<P>;
    contextConsumer?: ComponentType<{ children: (context: any) => React.ReactElement }>;
  },
) {
  const ContextAwareComponent = forwardRef<any, P>((props, ref) => {
    if (!options.contextConsumer) {
      return <Component ref={ref} {...(props as P)} />;
    }

    return (
      <options.contextConsumer>
        {(context) => {
          const contextProps = options.mapContextToProps(context, props as P);
          return <Component ref={ref} {...(props as P)} {...contextProps} />;
        }}
      </options.contextConsumer>
    );
  });

  ContextAwareComponent.displayName = `ContextAware(${Component.displayName || Component.name || 'Component'})`;
  return ContextAwareComponent;
}

/**
 * Factory function to create app-specific context-aware components
 *
 * @example
 * ```tsx
 * // In your app
 * export const FavoriteButton = createContextAwareComponent(
 *   ContextAwareLikeButton,
 *   (productId: string) => {
 *     const { isFavorite, toggleFavorite } = useGuestActions();
 *     return {
 *       liked: isFavorite(productId),
 *       onClick: () => toggleFavorite(productId)
 *     };
 *   }
 * );
 * ```
 */
export function createContextAwareComponent<P extends object, CP extends object>(
  BaseComponent: ComponentType<P>,
  useContextProps: (props: CP) => Partial<P>,
): ComponentType<CP & Omit<P, keyof ReturnType<typeof useContextProps>>> {
  const ContextAwareComponent = forwardRef<
    any,
    CP & Omit<P, keyof ReturnType<typeof useContextProps>>
  >((props, ref) => {
    const contextProps = useContextProps(props as CP);
    const baseProps = props as unknown as P;
    return <BaseComponent ref={ref} {...baseProps} {...contextProps} />;
  });

  ContextAwareComponent.displayName = `ContextAware(${BaseComponent.displayName || BaseComponent.name || 'Component'})`;
  return ContextAwareComponent as unknown as ComponentType<
    CP & Omit<P, keyof ReturnType<typeof useContextProps>>
  >;
}
