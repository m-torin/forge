// @ts-nocheck - Test file with component prop compatibility issues
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import ProductCardLarge from '../../../mantine-ciseco/components/ProductCardLarge';
import { mockProduct } from '../test-utils';

describe('ProductCardLarge', () => {
  const defaultProduct = mockProduct();
  const mockOnClick = vi.fn();
  const mockOnAddToCart = vi.fn();
  const mockOnLike = vi.fn();
  const mockOnQuickView = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    mockOnAddToCart.mockClear();
    mockOnLike.mockClear();
    mockOnQuickView.mockClear();
  });

  it('renders large product card with enhanced layout', () => {
    render(<ProductCardLarge product={defaultProduct} />);

    expect(screen.getByText(defaultProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${defaultProduct.price}`)).toBeInTheDocument();
    expect(screen.getByAltText(defaultProduct.name)).toBeInTheDocument();
    expect(screen.getByTestId('product-card-large')).toHaveClass('large-layout');
  });

  it('displays expanded product information', () => {
    render(<ProductCardLarge product={defaultProduct} showExtendedInfo />);

    expect(screen.getByText(defaultProduct.description)).toBeInTheDocument();
    expect(screen.getByText(defaultProduct.category)).toBeInTheDocument();
    expect(screen.getByText(`${defaultProduct.rating} stars`)).toBeInTheDocument();
  });

  it('renders multiple product images in gallery', () => {
    render(<ProductCardLarge product={defaultProduct} showImageGallery />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(defaultProduct.images.length);

    defaultProduct.images.forEach((imageSrc, index) => {
      if (index < 3) {
        // Usually shows first 3 images
        expect(screen.getByAltText(`${defaultProduct.name} view ${index + 1}`)).toBeInTheDocument();
      }
    });
  });

  it('handles image gallery navigation', () => {
    render(<ProductCardLarge product={defaultProduct} showImageGallery />);

    if (defaultProduct.images.length > 1) {
      const nextButton = screen.getByLabelText('Next image');
      const prevButton = screen.getByLabelText('Previous image');

      fireEvent.click(nextButton);
      // Should navigate to next image

      fireEvent.click(prevButton);
      // Should navigate to previous image
    }
  });

  it('shows detailed variant selection', () => {
    render(<ProductCardLarge product={defaultProduct} showVariantDetails />);

    // Size selection with labels
    expect(screen.getByText('Size:')).toBeInTheDocument();
    defaultProduct.sizes.forEach((size) => {
      const sizeButton = screen.getByRole('button', { name: size });
      expect(sizeButton).toBeInTheDocument();
    });

    // Color selection with swatches
    expect(screen.getByText('Color:')).toBeInTheDocument();
    defaultProduct.colors.forEach((color) => {
      expect(screen.getByLabelText(`Select ${color} color`)).toBeInTheDocument();
    });
  });

  it('displays detailed pricing information', () => {
    const productWithComplexPricing = mockProduct({
      price: 100,
      salePrice: 75,
      memberPrice: 70,
      tax: 8.25,
      shipping: 9.99,
    });

    render(<ProductCardLarge product={productWithComplexPricing} showDetailedPricing />);

    expect(screen.getByText('$75.00')).toBeInTheDocument(); // Sale price
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // Original price
    expect(screen.getByText('Member: $70.00')).toBeInTheDocument();
    expect(screen.getByText('+ $8.25 tax')).toBeInTheDocument();
    expect(screen.getByText('+ $9.99 shipping')).toBeInTheDocument();
  });

  it('shows enhanced product features', () => {
    const productWithFeatures = mockProduct({
      features: ['Free Shipping', 'Easy Returns', '1 Year Warranty', 'Eco-Friendly'],
      badges: ['New', 'Best Seller'],
    });

    render(<ProductCardLarge product={productWithFeatures} showFeatures />);

    productWithFeatures.features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });

    productWithFeatures.badges.forEach((badge) => {
      expect(screen.getByText(badge)).toBeInTheDocument();
    });
  });

  it('displays customer reviews section', () => {
    const productWithReviews = mockProduct({
      rating: 4.5,
      reviewCount: 128,
      reviews: [
        { id: 1, author: 'John D.', rating: 5, comment: 'Great product!' },
        { id: 2, author: 'Jane S.', rating: 4, comment: 'Good quality' },
      ],
    });

    render(<ProductCardLarge product={productWithReviews} showReviews />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(128 reviews)')).toBeInTheDocument();
    expect(screen.getByText('John D.')).toBeInTheDocument();
    expect(screen.getByText('Great product!')).toBeInTheDocument();
  });

  it('handles quantity selection with advanced controls', () => {
    render(<ProductCardLarge product={defaultProduct} showQuantityControls />);

    const quantityInput = screen.getByRole('spinbutton');
    const increaseButton = screen.getByLabelText('Increase quantity');
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const bulkButton = screen.getByText('Buy 10+ (5% off)');

    expect(quantityInput).toBeInTheDocument();
    expect(increaseButton).toBeInTheDocument();
    expect(decreaseButton).toBeInTheDocument();
    expect(bulkButton).toBeInTheDocument();
  });

  it('shows shipping and delivery information', () => {
    const productWithShipping = mockProduct({
      shipping: {
        freeShipping: true,
        estimatedDelivery: '2-3 business days',
        expeditedAvailable: true,
      },
    });

    render(<ProductCardLarge product={productWithShipping} showShippingInfo />);

    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    expect(screen.getByText('Delivery: 2-3 business days')).toBeInTheDocument();
    expect(screen.getByText('Expedited shipping available')).toBeInTheDocument();
  });

  it('displays availability and stock information', () => {
    const productWithStock = mockProduct({
      stock: 15,
      availability: 'in-stock',
      backorderDate: null,
      locations: ['Warehouse A', 'Store #123'],
    });

    render(<ProductCardLarge product={productWithStock} showAvailability />);

    expect(screen.getByText('15 in stock')).toBeInTheDocument();
    expect(screen.getByText('Available at 2 locations')).toBeInTheDocument();
  });

  it('renders enhanced action buttons', () => {
    render(
      <ProductCardLarge
        product={defaultProduct}
        onAddToCart={mockOnAddToCart}
        onLike={mockOnLike}
        onQuickView={mockOnQuickView}
        showEnhancedActions
      />,
    );

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    expect(screen.getByText('Add to Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Quick View')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('handles wishlist functionality', () => {
    const mockOnWishlist = vi.fn();
    render(<ProductCardLarge product={defaultProduct} onWishlist={mockOnWishlist} showWishlist />);

    const wishlistButton = screen.getByLabelText('Add to wishlist');
    fireEvent.click(wishlistButton);

    expect(mockOnWishlist).toHaveBeenCalledWith(defaultProduct);
  });

  it('shows comparison functionality', () => {
    const mockOnCompare = vi.fn();
    render(<ProductCardLarge product={defaultProduct} onCompare={mockOnCompare} showCompare />);

    const compareCheckbox = screen.getByRole('checkbox', { name: /compare/i });
    fireEvent.click(compareCheckbox);

    expect(mockOnCompare).toHaveBeenCalledWith(defaultProduct, true);
  });

  it('displays social sharing options', () => {
    const mockOnShare = vi.fn();
    render(<ProductCardLarge product={defaultProduct} onShare={mockOnShare} showSocialShare />);

    const shareButton = screen.getByLabelText('Share product');
    fireEvent.click(shareButton);

    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Pinterest')).toBeInTheDocument();
  });

  it('handles responsive layout changes', () => {
    render(<ProductCardLarge product={defaultProduct} responsive />);
    const card = screen.getByTestId('product-card-large');

    // Should adapt layout based on screen size
    expect(card).toHaveClass('responsive-large-card');
  });

  it('shows detailed product specifications', () => {
    const productWithSpecs = mockProduct({
      specifications: {
        Material: 'Cotton blend',
        Care: 'Machine wash cold',
        Origin: 'Made in USA',
        Weight: '200g',
      },
    });

    render(<ProductCardLarge product={productWithSpecs} showSpecifications />);

    expect(screen.getByText('Specifications')).toBeInTheDocument();
    expect(screen.getByText('Material:')).toBeInTheDocument();
    expect(screen.getByText('Cotton blend')).toBeInTheDocument();
    expect(screen.getByText('Care:')).toBeInTheDocument();
    expect(screen.getByText('Machine wash cold')).toBeInTheDocument();
  });

  it('displays related products section', () => {
    const relatedProducts = [
      mockProduct({ id: '2', name: 'Related Product 1' }),
      mockProduct({ id: '3', name: 'Related Product 2' }),
    ];

    render(
      <ProductCardLarge product={defaultProduct} relatedProducts={relatedProducts} showRelated />,
    );

    expect(screen.getByText('You might also like')).toBeInTheDocument();
    expect(screen.getByText('Related Product 1')).toBeInTheDocument();
    expect(screen.getByText('Related Product 2')).toBeInTheDocument();
  });

  it('handles bundle and package deals', () => {
    const productWithBundle = mockProduct({
      bundle: {
        items: ['Main Product', 'Accessory 1', 'Accessory 2'],
        bundlePrice: 150,
        savings: 25,
      },
    });

    render(<ProductCardLarge product={productWithBundle} showBundle />);

    expect(screen.getByText('Bundle Deal')).toBeInTheDocument();
    expect(screen.getByText('Save $25')).toBeInTheDocument();
    expect(screen.getByText('Bundle Price: $150')).toBeInTheDocument();
  });

  it('shows size guide and fit information', () => {
    render(<ProductCardLarge product={defaultProduct} showSizeGuide />);

    const sizeGuideButton = screen.getByText('Size Guide');
    fireEvent.click(sizeGuideButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Size Chart')).toBeInTheDocument();
  });

  it('displays loyalty program benefits', () => {
    const productWithLoyalty = mockProduct({
      loyaltyPoints: 150,
      memberBenefits: ['5% cashback', 'Free returns', 'Early access'],
    });

    render(<ProductCardLarge product={productWithLoyalty} showLoyalty />);

    expect(screen.getByText('Earn 150 points')).toBeInTheDocument();
    expect(screen.getByText('5% cashback')).toBeInTheDocument();
    expect(screen.getByText('Free returns')).toBeInTheDocument();
  });

  it('handles installment payment options', () => {
    const productWithPayment = mockProduct({
      installments: {
        available: true,
        months: 12,
        monthlyAmount: 8.33,
        apr: 0,
      },
    });

    render(<ProductCardLarge product={productWithPayment} showInstallments />);

    expect(screen.getByText('Pay in 12 installments')).toBeInTheDocument();
    expect(screen.getByText('$8.33/month')).toBeInTheDocument();
    expect(screen.getByText('0% APR')).toBeInTheDocument();
  });
});
