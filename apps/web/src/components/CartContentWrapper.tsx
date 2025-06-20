'use client';

import { useCart } from '@/react/GuestActionsContext';
import { CartContent } from './CartContent';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Stack, Text, Button } from '@mantine/core';

interface CartContentWrapperProps {
  className?: string;
  onClose?: () => void;
  'data-testid'?: string;
}

/**
 * Wrapper component that gets cart data from GuestActionsContext
 * This allows cart to work for both authenticated and guest users
 */
function CartContentWrapperInner({
  className,
  onClose,
  'data-testid': testId,
}: CartContentWrapperProps) {
  const cart = useCart();
  const { items, subtotal } = cart.getCart();

  // Create a modified CartContent that injects handlers
  const CartContentWithHandlers = ({ cart: cartData, ...props }: any) => {
    const formattedLines = cartData.items.map((item: any) => ({
      ...item,
      onRemove: () => cart.removeFromCart(item.productId, item.variantId),
      onUpdateQuantity: (quantity: number) =>
        cart.updateQuantity(item.productId, quantity, item.variantId),
    }));

    return <CartContent {...props} cart={{ ...cartData, lines: formattedLines }} />;
  };

  // Format cart data to match expected structure
  const formattedCart = {
    items: items.map((item, index) => ({
      id: `${item.productId}-${item.variantId || 'default'}-${index}`,
      productId: item.productId,
      variantId: item.variantId,
      title: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      handle: item.productId,
      color: item.metadata?.color,
      size: item.metadata?.size,
      ...item.metadata,
    })),
    subtotal,
  };

  return (
    <CartContentWithHandlers
      className={className}
      onClose={onClose}
      cart={formattedCart}
      data-testid={testId}
    />
  );
}

export function CartContentWrapper(props: CartContentWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <Stack gap="md" p="md" ta="center">
          <Text size="lg" fw={500}>
            Cart Unavailable
          </Text>
          <Text c="dimmed">
            We're unable to load your cart right now. Please try refreshing the page.
          </Text>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </Stack>
      }
    >
      <CartContentWrapperInner {...props} />
    </ErrorBoundary>
  );
}
