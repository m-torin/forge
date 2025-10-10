import { addToCart } from '@/app/actions';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('server Actions', () => {
  describe('addToCart', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    test('should process form data correctly', async () => {
      const formData = new FormData();
      formData.append('productId', '123');
      formData.append('quantity', '2');
      formData.append('size', 'M');
      formData.append('color', 'Blue');

      await addToCart(formData);

      expect(consoleLogSpy).toHaveBeenCalledWith('Add to cart submitted:', {
        productId: '123',
        quantity: '2',
        size: 'M',
        color: 'Blue',
      });
    });

    test('should handle empty form data', async () => {
      const formData = new FormData();

      await addToCart(formData);

      expect(consoleLogSpy).toHaveBeenCalledWith('Add to cart submitted:', {});
    });

    test('should handle form data with multiple values for same key', async () => {
      const formData = new FormData();
      formData.append('productId', '123');
      formData.append('productId', '456');
      formData.append('quantity', '1');

      await addToCart(formData);

      // Object.fromEntries only keeps the last value for duplicate keys
      expect(consoleLogSpy).toHaveBeenCalledWith('Add to cart submitted:', {
        productId: '456',
        quantity: '1',
      });
    });

    test('should handle special characters in form data', async () => {
      const formData = new FormData();
      formData.append('productName', 'Product with special chars: !@#$%^&*()');
      formData.append('notes', 'Multi\nline\nnotes');

      await addToCart(formData);

      expect(consoleLogSpy).toHaveBeenCalledWith('Add to cart submitted:', {
        productName: 'Product with special chars: !@#$%^&*()',
        notes: 'Multi\nline\nnotes',
      });
    });

    test('should handle numeric values as strings', async () => {
      const formData = new FormData();
      formData.append('productId', '123');
      formData.append('quantity', '5');
      formData.append('price', '99.99');

      await addToCart(formData);

      expect(consoleLogSpy).toHaveBeenCalledWith('Add to cart submitted:', {
        productId: '123',
        quantity: '5',
        price: '99.99',
      });
    });
  });
});
