'use server';

import { logInfo } from '@repo/observability/server/next';

export async function addToCart(formData: FormData) {
  // Handle form submission logic here
  const formObjectEntries = Object.fromEntries(formData.entries());
  logInfo('Add to cart submitted', { formData: formObjectEntries });
  // TODO: Add your cart logic here, such as updating the cart state or making an API call
}
