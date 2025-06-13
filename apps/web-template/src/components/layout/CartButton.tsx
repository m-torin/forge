'use client';

import { ActionIcon, Indicator } from '@mantine/core';
import { IconShoppingBag } from '@tabler/icons-react';
import Link from 'next/link';
import { type FC } from 'react';

interface CartButtonProps {
  'data-testid'?: string;
  locale?: string;
  numberItems?: number;
  onClick?: () => void;
}

const CartButton: FC<CartButtonProps> = ({
  'data-testid': testId = 'cart-button',
  locale = 'en',
  numberItems = 0,
  onClick,
}) => {
  const button = (
    <Indicator
      disabled={numberItems === 0}
      inline
      label={numberItems > 99 ? '99+' : numberItems}
      size={16}
    >
      <ActionIcon
        aria-label={`Shopping cart with ${numberItems} items`}
        className="text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
        data-testid={testId}
        radius="sm"
        size="lg"
        variant="subtle"
        onClick={onClick}
      >
        <IconShoppingBag size={20} />
      </ActionIcon>
    </Indicator>
  );

  if (onClick) {
    return button;
  }

  return <Link href={`/${locale}/cart`}>{button}</Link>;
};

export default CartButton;
