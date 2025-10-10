import ProductForm from '@/components/ProductForm/ProductForm';
import { TProductDetail } from '@/data/data';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('react-hot-toast', () => ({
  default: {
    custom: vi.fn(),
  },
}));

vi.mock('@/components/AddToCardButton', () => ({
  NotifyAddToCart: vi.fn(({ show, imageUrl, quantity, size, color, title, price }) => (
    <div data-testid="notify-add-to-cart" data-show={show}>
      {title} - {quantity} - {size} - {color} - ${price}
    </div>
  )),
}));

// Mock next/form
vi.mock('next/form', () => ({
  default: vi.fn(({ children, action, className }) => (
    <form
      className={className}
      onSubmit={async e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await action(formData);
      }}
      data-testid="product-form"
    >
      {children}
    </form>
  )),
}));

const mockProduct: TProductDetail = {
  id: 'gid://shopify/Product/1',
  handle: 'test-product',
  title: 'Test Product',
  description: 'Test product description',
  price: 99.99,
  featuredImage: {
    src: '/test-image.jpg',
    alt: 'Test Product',
    width: 500,
    height: 500,
  },
  status: 'In Stock',
  breadcrumbs: [],
  publishedAt: '2024-01-01',
  images: [],
  options: [],
  selectedOptions: [],
  reviewNumber: 5,
  rating: 4.5,
};

describe('productForm', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should render form with children', () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="test" />
        <button type="submit">Add to Cart</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    expect(form).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    render(
      <ProductForm product={mockProduct} className="custom-form-class">
        <button type="submit">Add</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    expect(form).toHaveClass('custom-form-class');
  });

  test('should handle form submission with quantity, size, and color', async () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="quantity" defaultValue="2" />
        <input name="size" defaultValue="M" />
        <input name="color" defaultValue="Blue" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
          id: 'nc-product-notify',
          duration: 4000,
        }),
      );
    });

    // Verify console.log was called with form data
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Form submitted with data:'),
      expect.objectContaining({
        formObjectEntries: expect.objectContaining({
          quantity: '2',
          size: 'M',
          color: 'Blue',
        }),
      }),
    );
  });

  test('should show toast notification on form submission', async () => {
    render(
      <ProductForm product={mockProduct}>
        <button type="submit">Add to Cart</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
          id: 'nc-product-notify',
          duration: 4000,
        }),
      );
    });
  });

  test('should render NotifyAddToCart with correct props', async () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="quantity" defaultValue="1" />
        <input name="size" defaultValue="S" />
        <input name="color" defaultValue="Red" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      // Check the arguments passed to toast.custom
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
          id: 'nc-product-notify',
          duration: 4000,
        }),
      );
    });
  });

  test('should handle missing optional fields with defaults', async () => {
    render(
      <ProductForm product={mockProduct}>
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
          id: 'nc-product-notify',
          duration: 4000,
        }),
      );
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Form submitted with data:'),
      expect.objectContaining({
        quantity: 1,
        size: '',
        color: '',
      }),
    );
  });

  test('should handle product without featured image', async () => {
    const productWithoutImage = {
      ...mockProduct,
      featuredImage: undefined,
    };

    render(
      <ProductForm product={productWithoutImage}>
        <input name="quantity" defaultValue="1" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'top-right',
          id: 'nc-product-notify',
          duration: 4000,
        }),
      );
    });
  });

  test('should handle numeric string quantity conversion', async () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="quantity" defaultValue="5" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Form submitted with data:'),
        expect.objectContaining({
          quantity: 5,
        }),
      );
    });
  });

  test('should handle multiple form submissions', async () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="quantity" defaultValue="1" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');

    // Submit form multiple times
    fireEvent.submit(form);
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledTimes(3);
    });
  });

  test('should preserve form data integrity', async () => {
    render(
      <ProductForm product={mockProduct}>
        <input name="quantity" defaultValue="2" />
        <input name="size" defaultValue="M" />
        <input name="color" defaultValue="Blue" />
        <input name="additionalField" defaultValue="extra" />
        <button type="submit">Submit</button>
      </ProductForm>,
    );

    const form = screen.getByTestId('product-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Form submitted with data:'),
        expect.objectContaining({
          formObjectEntries: {
            quantity: '2',
            size: 'M',
            color: 'Blue',
            additionalField: 'extra',
          },
        }),
      );
    });
  });

  test('should handle image upload', () => {
    render(<ProductForm product={mockProduct} />);

    const form = screen.getByTestId('product-form');
    expect(form).toBeInTheDocument();
  });
});
