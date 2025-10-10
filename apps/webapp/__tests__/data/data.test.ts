import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Import the actual functions
import {
  getBlogPosts,
  getBlogPostsByHandle,
  getCollectionByHandle,
  getCollections,
  getCountries,
  getGroupCollections,
  getOrder,
  getOrders,
  getProductByHandle,
  getProductDetailByHandle,
  getProductReviews,
  getProducts,
  getShopData,
} from '@/data/data';

// Reset the mock for this test
vi.unmock('@/data/data');

// Mock the shuffleArray function
vi.mock('@/utils/shuffleArray', () => ({
  shuffleArray: vi.fn(arr => arr),
}));

// Note: All image imports are now handled by @repo/qa centralized image mock pattern

// Mock product images - have to do this manually since vi.mock is hoisted
vi.mock('@/images/products/p1.jpg', () => ({
  default: { src: '/product1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p2.jpg', () => ({
  default: { src: '/product2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p3.jpg', () => ({
  default: { src: '/product3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p4.jpg', () => ({
  default: { src: '/product4.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p5.jpg', () => ({
  default: { src: '/product5.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p6.jpg', () => ({
  default: { src: '/product6.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p7.jpg', () => ({
  default: { src: '/product7.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p8.jpg', () => ({
  default: { src: '/product8.jpg', width: 800, height: 600 },
}));

// Mock product variant images
vi.mock('@/images/products/p1-1.jpg', () => ({
  default: { src: '/product1-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p1-2.jpg', () => ({
  default: { src: '/product1-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p1-3.jpg', () => ({
  default: { src: '/product1-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p2-1.jpg', () => ({
  default: { src: '/product2-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p2-2.jpg', () => ({
  default: { src: '/product2-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p2-3.jpg', () => ({
  default: { src: '/product2-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p3-1.jpg', () => ({
  default: { src: '/product3-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p3-2.jpg', () => ({
  default: { src: '/product3-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p3-3.jpg', () => ({
  default: { src: '/product3-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p4-1.jpg', () => ({
  default: { src: '/product4-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p4-2.jpg', () => ({
  default: { src: '/product4-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p4-3.jpg', () => ({
  default: { src: '/product4-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p5-1.jpg', () => ({
  default: { src: '/product5-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p5-2.jpg', () => ({
  default: { src: '/product5-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p5-3.jpg', () => ({
  default: { src: '/product5-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p6-1.jpg', () => ({
  default: { src: '/product6-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p6-2.jpg', () => ({
  default: { src: '/product6-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p6-3.jpg', () => ({
  default: { src: '/product6-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p7-1.jpg', () => ({
  default: { src: '/product7-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p7-2.jpg', () => ({
  default: { src: '/product7-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p7-3.jpg', () => ({
  default: { src: '/product7-3.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p8-1.jpg', () => ({
  default: { src: '/product8-1.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p8-2.jpg', () => ({
  default: { src: '/product8-2.jpg', width: 800, height: 600 },
}));
vi.mock('@/images/products/p8-3.jpg', () => ({
  default: { src: '/product8-3.jpg', width: 800, height: 600 },
}));

// Mock avatar images
vi.mock('@/images/users/avatar1.jpg', () => ({ default: { src: '/avatar1.jpg' } }));
vi.mock('@/images/users/avatar2.jpg', () => ({ default: { src: '/avatar2.jpg' } }));
vi.mock('@/images/users/avatar3.jpg', () => ({ default: { src: '/avatar3.jpg' } }));
vi.mock('@/images/users/avatar4.jpg', () => ({ default: { src: '/avatar4.jpg' } }));

describe('data Layer Functions', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('getOrder', () => {
    test('should return order by number', async () => {
      const order = await getOrder('4657');

      expect(order).toBeDefined();
      expect(order?.number).toBe('4657');
      expect(order?.date).toBe('March 22, 2025');
      expect(order?.status).toBe('Delivered on January 11, 2025');
    });

    test('should return first order as fallback when order not found', async () => {
      const order = await getOrder('9999');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Order with number 9999 not found. Returning the first order as a fallback.',
      );
      expect(order).toBeDefined();
      expect(order?.number).toBe('4657');
    });

    test('should handle order with complete cost structure', async () => {
      const order = await getOrder('4657');

      expect(order?.cost).toStrictEqual({
        subtotal: 199,
        shipping: 0,
        tax: 0,
        total: 199,
        discount: 0,
      });
    });

    test('should include products in order', async () => {
      const order = await getOrder('4657');

      expect(order?.products).toBeDefined();
      expect(order?.products.length).toBeGreaterThan(0);
      expect(order?.products[0]).toHaveProperty('id');
      expect(order?.products[0]).toHaveProperty('title');
      expect(order?.products[0]).toHaveProperty('price');
    });
  });

  describe('getOrders', () => {
    test('should return array of orders', async () => {
      const orders = await getOrders();

      expect(Array.isArray(orders)).toBeTruthy();
      expect(orders.length).toBeGreaterThan(0);
    });

    test('should have valid order structure', async () => {
      const orders = await getOrders();
      const firstOrder = orders[0];

      expect(firstOrder).toHaveProperty('number');
      expect(firstOrder).toHaveProperty('date');
      expect(firstOrder).toHaveProperty('status');
      expect(firstOrder).toHaveProperty('totalQuantity');
      expect(firstOrder).toHaveProperty('cost');
      expect(firstOrder).toHaveProperty('products');
    });
  });

  describe('getCountries', () => {
    test('should return array of countries', async () => {
      const countries = await getCountries();

      expect(Array.isArray(countries)).toBeTruthy();
      expect(countries.length).toBeGreaterThan(0);
    });

    test('should have valid country structure', async () => {
      const countries = await getCountries();
      const firstCountry = countries[0];

      expect(firstCountry).toHaveProperty('name');
      expect(firstCountry).toHaveProperty('code');
      expect(firstCountry).toHaveProperty('flagUrl');
    });

    test('should include major countries', async () => {
      const countries = await getCountries();
      const countryNames = countries.map(c => c.name);

      expect(countryNames).toContain('United States');
      expect(countryNames).toContain('Canada');
      expect(countryNames).toContain('Mexico');
    });
  });

  describe('getShopData', () => {
    test('should return shop information', async () => {
      const shopData = await getShopData();

      expect(shopData).toBeDefined();
      expect(shopData).toHaveProperty('name');
      expect(shopData).toHaveProperty('description');
    });
  });

  describe('getProductReviews', () => {
    test('should return reviews for a product', async () => {
      const reviews = await getProductReviews('test-handle');

      expect(Array.isArray(reviews)).toBeTruthy();
    });

    test('should have valid review structure', async () => {
      const reviews = await getProductReviews('test-handle');

      expect(reviews.length).toBeGreaterThan(0);
      const firstReview = reviews[0];
      expect(firstReview).toHaveProperty('id');
      expect(firstReview).toHaveProperty('author');
      expect(firstReview).toHaveProperty('rating');
      expect(firstReview).toHaveProperty('content');
      expect(firstReview).toHaveProperty('title');
    });
  });

  describe('getBlogPosts', () => {
    test('should return array of blog posts', async () => {
      const posts = await getBlogPosts();

      expect(Array.isArray(posts)).toBeTruthy();
      expect(posts.length).toBeGreaterThan(0);
    });

    test('should have valid blog post structure', async () => {
      const posts = await getBlogPosts();
      const firstPost = posts[0];

      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('handle');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('excerpt');
      expect(firstPost).toHaveProperty('author');
    });
  });

  describe('getBlogPostsByHandle', () => {
    test('should return a specific blog post', async () => {
      const posts = await getBlogPosts();
      const firstPost = posts[0];

      const post = await getBlogPostsByHandle(firstPost.handle);

      expect(post).toBeDefined();
      expect(post?.handle).toBe(firstPost.handle);
    });

    test('should return first post as fallback for non-existent handle', async () => {
      const posts = await getBlogPosts();
      const post = await getBlogPostsByHandle('non-existent-handle');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Post with handle non-existent-handle not found. Returning the first post as a fallback.',
      );
      expect(post).toBeDefined();
      expect(post?.id).toBe(posts[0].id);
    });
  });

  describe('getCollections', () => {
    test('should return array of collections', async () => {
      const collections = await getCollections();

      expect(Array.isArray(collections)).toBeTruthy();
      expect(collections.length).toBeGreaterThan(0);
    });

    test('should have valid collection structure', async () => {
      const collections = await getCollections();
      const firstCollection = collections[0];

      expect(firstCollection).toHaveProperty('id');
      expect(firstCollection).toHaveProperty('handle');
      expect(firstCollection).toHaveProperty('title');
      // featuredImage might be optional or named differently
      expect(firstCollection).toHaveProperty('image');
    });
  });

  describe('getGroupCollections', () => {
    test('should return grouped collections', async () => {
      const groupedCollections = await getGroupCollections();

      expect(Array.isArray(groupedCollections)).toBeTruthy();
      expect(groupedCollections.length).toBeGreaterThan(0);
    });

    test('should have valid group structure', async () => {
      const groupedCollections = await getGroupCollections();
      const firstGroup = groupedCollections[0];

      expect(firstGroup).toHaveProperty('title');
      expect(firstGroup).toHaveProperty('collections');
      expect(Array.isArray(firstGroup.collections)).toBeTruthy();
    });
  });

  describe('getCollectionByHandle', () => {
    test('should return collection by handle', async () => {
      const collections = await getCollections();
      const firstCollection = collections[0];

      const collection = await getCollectionByHandle(firstCollection.handle);

      expect(collection).toBeDefined();
      expect(collection?.handle).toBe(firstCollection.handle);
    });

    test('should return first collection as fallback for non-existent handle', async () => {
      const collections = await getCollections();
      const collection = await getCollectionByHandle('non-existent-handle');

      // Function returns first collection as fallback
      expect(collection).toBeDefined();
      expect(collection?.id).toBe(collections[0].id);
    });
  });

  describe('getProducts', () => {
    test('should return array of products', async () => {
      const products = await getProducts();

      expect(Array.isArray(products)).toBeTruthy();
      expect(products.length).toBeGreaterThan(0);
    });

    test('should have valid product structure', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('handle');
      expect(firstProduct).toHaveProperty('title');
      expect(firstProduct).toHaveProperty('price');
      expect(firstProduct).toHaveProperty('featuredImage');
    });
  });

  describe('getProductByHandle', () => {
    test('should return product by handle', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      const product = await getProductByHandle(firstProduct.handle);

      expect(product).toBeDefined();
      expect(product?.handle).toBe(firstProduct.handle);
    });

    test('should return first product as fallback for non-existent handle', async () => {
      const products = await getProducts();
      const product = await getProductByHandle('non-existent-handle');

      // Function returns first product as fallback
      expect(product).toBeDefined();
      expect(product?.id).toBe(products[0].id);
    });
  });

  describe('getProductDetailByHandle', () => {
    test('should return detailed product information', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      const productDetail = await getProductDetailByHandle(firstProduct.handle);

      expect(productDetail).toBeDefined();
      expect(productDetail?.handle).toBe(firstProduct.handle);
    });

    test('should include additional detail fields', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      const productDetail = await getProductDetailByHandle(firstProduct.handle);

      // Product detail should have basic product properties
      expect(productDetail).toHaveProperty('id');
      expect(productDetail).toHaveProperty('handle');
      expect(productDetail).toHaveProperty('title');
      expect(productDetail).toHaveProperty('price');
    });

    test('should return first product as fallback for non-existent handle', async () => {
      const products = await getProducts();
      const productDetail = await getProductDetailByHandle('non-existent-handle');

      // Function returns first product as fallback (through getProductByHandle)
      expect(productDetail).toBeDefined();
      expect(productDetail?.id).toBe(products[0].id);
    });
  });

  describe('data Integrity', () => {
    test('should have consistent product handles across functions', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      const productByHandle = await getProductByHandle(firstProduct.handle);
      const productDetail = await getProductDetailByHandle(firstProduct.handle);

      expect(productByHandle?.id).toBe(firstProduct.id);
      expect(productDetail?.id).toBe(firstProduct.id);
    });

    test('should have valid image references', async () => {
      const products = await getProducts();
      const firstProduct = products[0];

      expect(firstProduct.featuredImage).toBeDefined();
      expect(firstProduct.featuredImage?.src).toContain('/product');
    });

    test('should have valid price values', async () => {
      const products = await getProducts();

      products.forEach(product => {
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
      });
    });
  });
});
