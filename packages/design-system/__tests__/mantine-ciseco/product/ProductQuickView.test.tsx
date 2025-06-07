import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import ProductQuickView from '../../../mantine-ciseco/components/ProductQuickView';
import { mockProduct } from '../test-utils';

describe('ProductQuickView', () => {
  const defaultProduct = mockProduct();
  const mockOnClose = vi.fn();
  const mockOnAddToCart = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnAddToCart.mockClear();
    mockOnViewDetails.mockClear();
  });

  it('renders quick view modal when open', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(defaultProduct.name)).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen={false} onClose={mockOnClose} />);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const closeButton = screen.getByLabelText('Close');

    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when escape key is pressed', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const backdrop = screen.getByTestId('modal-backdrop');

    await act(async () => {
      fireEvent.click(backdrop);
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders product image gallery', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveAttribute('alt', defaultProduct.name);
  });

  it('shows product price', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText(`$${defaultProduct.price}`)).toBeInTheDocument();
  });

  it('shows sale price when available', async () => {
    const productWithSale = mockProduct({
      price: 100,
      salePrice: 75,
    });

    await act(async () => {
      render(<ProductQuickView product={productWithSale} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText('$75')).toBeInTheDocument();
    expect(screen.getByText('$100')).toHaveClass('line-through');
  });

  it('renders product description', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText(defaultProduct.description)).toBeInTheDocument();
  });

  it('renders size selector when sizes available', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText('Size')).toBeInTheDocument();
    defaultProduct.sizes.forEach((size) => {
      expect(screen.getByText(size)).toBeInTheDocument();
    });
  });

  it('renders color selector when colors available', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText('Color')).toBeInTheDocument();
    defaultProduct.colors.forEach((color) => {
      expect(screen.getByLabelText(`Color: ${color}`)).toBeInTheDocument();
    });
  });

  it('handles size selection', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const sizeButton = screen.getByText('M');

    await act(async () => {
      fireEvent.click(sizeButton);
    });

    expect(sizeButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles color selection', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const colorButton = screen.getByLabelText('Color: red');

    await act(async () => {
      fireEvent.click(colorButton);
    });

    expect(colorButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders quantity selector', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('handles quantity changes', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    const quantityInput = screen.getByRole('spinbutton');
    const increaseButton = screen.getByLabelText('Increase quantity');

    await act(async () => {
      fireEvent.click(increaseButton);
    });

    expect(quantityInput).toHaveValue(2);
  });

  it('renders add to cart button', async () => {
    await act(async () => {
      render(
        <ProductQuickView
          product={defaultProduct}
          isOpen
          onClose={mockOnClose}
          onAddToCart={mockOnAddToCart}
        />,
      );
    });

    const addToCartButton = screen.getByText('Add to Cart');

    await act(async () => {
      fireEvent.click(addToCartButton);
    });

    expect(mockOnAddToCart).toHaveBeenCalledWith({
      product: defaultProduct,
      quantity: 1,
      selectedSize: null,
      selectedColor: null,
    });
  });

  it('renders view details button', async () => {
    await act(async () => {
      render(
        <ProductQuickView
          product={defaultProduct}
          isOpen
          onClose={mockOnClose}
          onViewDetails={mockOnViewDetails}
        />,
      );
    });

    const viewDetailsButton = screen.getByText('View Details');

    await act(async () => {
      fireEvent.click(viewDetailsButton);
    });

    expect(mockOnViewDetails).toHaveBeenCalledWith(defaultProduct);
  });

  it('shows product rating', async () => {
    await act(async () => {
      render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);
    });

    expect(screen.getByText(defaultProduct.rating.toString())).toBeInTheDocument();
    expect(screen.getByText(`(${defaultProduct.reviews} reviews)`)).toBeInTheDocument();
  });

  it('handles image navigation', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    if (defaultProduct.images.length > 1) {
      const nextButton = screen.getByLabelText('Next image');
      const prevButton = screen.getByLabelText('Previous image');

      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();

      fireEvent.click(nextButton);
      // Image should change
    }
  });

  it('shows image thumbnails', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    const thumbnails = screen.getAllByRole('button', { name: /Thumbnail/ });
    expect(thumbnails.length).toBe(defaultProduct.images.length);
  });

  it('handles thumbnail clicks', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    const thumbnail = screen.getByRole('button', { name: 'Thumbnail 2' });
    fireEvent.click(thumbnail);

    // Main image should change to the selected thumbnail
  });

  it('shows zoom functionality on main image', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    const mainImage = screen.getByRole('img', { name: defaultProduct.name });
    fireEvent.click(mainImage);

    expect(screen.getByTestId('image-zoom')).toBeInTheDocument();
  });

  it('handles out of stock state', () => {
    const outOfStockProduct = mockProduct({ status: 'out-of-stock' });

    render(<ProductQuickView product={outOfStockProduct} isOpen onClose={mockOnClose} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeDisabled();
  });

  it('shows availability status', () => {
    const lowStockProduct = mockProduct({ stock: 3 });

    render(<ProductQuickView product={lowStockProduct} isOpen onClose={mockOnClose} />);

    expect(screen.getByText('Only 3 left in stock')).toBeInTheDocument();
  });

  it('renders like button', () => {
    const mockOnLike = vi.fn();

    render(
      <ProductQuickView
        product={defaultProduct}
        isOpen
        onClose={mockOnClose}
        onLike={mockOnLike}
      />,
    );

    const likeButton = screen.getByLabelText('Like product');
    fireEvent.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(defaultProduct);
  });

  it('shows share functionality', () => {
    const mockOnShare = vi.fn();

    render(
      <ProductQuickView
        product={defaultProduct}
        isOpen
        onClose={mockOnClose}
        onShare={mockOnShare}
      />,
    );

    const shareButton = screen.getByLabelText('Share product');
    fireEvent.click(shareButton);

    expect(mockOnShare).toHaveBeenCalledWith(defaultProduct);
  });

  it('renders loading state', () => {
    render(<ProductQuickView isOpen onClose={mockOnClose} loading />);

    expect(screen.getByTestId('quick-view-skeleton')).toBeInTheDocument();
  });

  it('prevents body scroll when open', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    expect(document.body).toHaveStyle({ overflow: 'hidden' });
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />,
    );

    rerender(<ProductQuickView product={defaultProduct} isOpen={false} onClose={mockOnClose} />);

    expect(document.body).not.toHaveStyle({ overflow: 'hidden' });
  });

  it('has proper ARIA attributes', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('handles responsive design', () => {
    render(<ProductQuickView product={defaultProduct} isOpen onClose={mockOnClose} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('responsive-modal');
  });
});
