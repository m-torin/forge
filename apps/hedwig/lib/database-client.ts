/**
 * Client-safe database operations
 * This file wraps database calls to be used in server actions
 * avoiding the 'server-only' restriction in client components
 */

export async function findProductByBarcode(barcode: string) {
  const response = await fetch('/api/products/lookup', {
    body: JSON.stringify({ barcode }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to lookup product');
  }

  return response.json();
}

export async function createScanHistory(data: any) {
  const response = await fetch('/api/scan-history', {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to save scan history');
  }

  return response.json();
}

export async function getAllProducts() {
  const response = await fetch('/api/products');
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function searchProducts(query: string) {
  const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error('Failed to search products');
  }

  return response.json();
}