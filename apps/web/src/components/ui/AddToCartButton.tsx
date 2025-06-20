'use client';

import { Button, type ButtonProps } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconShoppingCart } from '@tabler/icons-react';
import { useCart, type CartItem } from '@/react/GuestActionsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  variantId?: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

function AddToCartButtonInner({
  product,
  variantId,
  quantity = 1,
  metadata,
  children = 'Add to Cart',
  ...buttonProps
}: AddToCartButtonProps) {
  const cart = useCart();
  const [isLoading, { open: startLoading, close: stopLoading }] = useDisclosure(false);

  const handleAddToCart = async () => {
    startLoading();
    try {
      const cartItem: CartItem = {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
        variantId,
        metadata,
      };

      await cart.addToCart(cartItem);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      stopLoading();
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      loading={isLoading}
      leftSection={<IconShoppingCart size={16} />}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}

export function AddToCartButton(props: AddToCartButtonProps) {
  return (
    <ErrorBoundary
      fallback={
        <Button variant="outline" disabled>
          Add to Cart
        </Button>
      }
    >
      <AddToCartButtonInner {...props} />
    </ErrorBoundary>
  );
}
