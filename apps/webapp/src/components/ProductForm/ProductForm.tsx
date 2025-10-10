'use client';

import { NotifyAddToCart } from '@/components/AddToCardButton';
import { TProductDetail } from '@/data/data';
import Form from 'next/form';
import React from 'react';
import toast from 'react-hot-toast';

const ProductForm = ({
  children,
  className,
  product,
  'data-testid': testId = 'product-form',
}: {
  children?: React.ReactNode;
  className?: string;
  product: TProductDetail;
  'data-testid'?: string;
}) => {
  const { featuredImage, title, price } = product;

  const notifyAddTocart = (quantity: number, size: string, color: string) => {
    toast.custom(
      t => (
        <NotifyAddToCart
          show={t.visible}
          imageUrl={featuredImage?.src || ''}
          quantity={quantity}
          size={size}
          color={color}
          title={title || 'Product'}
          price={price || 0}
        />
      ),
      { position: 'top-right', id: 'nc-product-notify', duration: 4000 },
    );
  };

  const onFormSubmit = async (formData: FormData) => {
    const _formObjectEntries = Object.fromEntries(formData.entries());
    const quantity = formData.get('quantity') ? Number(formData.get('quantity')) : 1;
    const size = formData.get('size') ? String(formData.get('size')) : '';
    const color = formData.get('color') ? String(formData.get('color')) : '';

    // Form submission data processed

    notifyAddTocart(quantity, size, color);
    // Here you can handle the form submission, such as adding the product to the cart
    // For example, you might call an API endpoint to add the product to the cart

    // TODO: Add cart logic here (e.g., call API to add product to cart)
  };

  return (
    <Form action={onFormSubmit} className={className} data-testid={testId}>
      {children}
    </Form>
  );
};

export default ProductForm;
