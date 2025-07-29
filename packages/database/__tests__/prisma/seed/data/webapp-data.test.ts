import {
  webappBlogPosts,
  webappCart,
  webappCollections,
  webappGroupCollections,
  webappNavigation,
  webappOrders,
  webappProducts,
  webappReviews,
  webappShopData,
} from '@/prisma/src/seed/data/webapp-data';
import { describe, expect, it } from 'vitest';

describe('webapp-data', () => {
  describe('webappProducts', () => {
    it('contains expected number of products', () => {
      expect(webappProducts).toHaveLength(8);
    });

    it('has correct product structure', () => {
      const product = webappProducts[0];
      expect(product.id).toBeDefined();
      expect(product.title).toBeDefined();
      expect(product.handle).toBeDefined();
      expect(product.vendor).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(product.featuredImage).toBeDefined();
      expect(product.images).toBeInstanceOf(Array);
      expect(product.options).toBeInstanceOf(Array);
    });

    it('has valid product options', () => {
      webappProducts.forEach((product: any) => {
        product.options.forEach((option: any) => {
          expect(option.name).toBeDefined();
          expect(option.optionValues).toBeInstanceOf(Array);
          expect(option.optionValues.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('webappCollections', () => {
    it('contains expected number of collections', () => {
      expect(webappCollections).toHaveLength(9);
    });

    it('has correct collection structure', () => {
      const collection = webappCollections[0];
      expect(collection.id).toBeDefined();
      expect(collection.title).toBeDefined();
      expect(collection.handle).toBeDefined();
      expect(collection.description).toBeDefined();
      expect(collection.count).toBeGreaterThan(0);
    });
  });

  describe('webappReviews', () => {
    it('contains expected number of reviews', () => {
      expect(webappReviews).toHaveLength(4);
    });

    it('has correct review structure', () => {
      const review = webappReviews[0];
      expect(review.id).toBeDefined();
      expect(review.title).toBeDefined();
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.content).toBeDefined();
      expect(review.author).toBeDefined();
    });
  });

  describe('webappBlogPosts', () => {
    it('contains expected number of blog posts', () => {
      expect(webappBlogPosts).toHaveLength(2);
    });

    it('has correct blog post structure', () => {
      const post = webappBlogPosts[0];
      expect(post.id).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.handle).toBeDefined();
      expect(post.excerpt).toBeDefined();
      expect(post.featuredImage).toBeDefined();
      expect(post.author).toBeDefined();
    });
  });

  describe('webappNavigation', () => {
    it('has currencies array', () => {
      expect(webappNavigation.currencies).toBeInstanceOf(Array);
      expect(webappNavigation.currencies.length).toBeGreaterThan(0);
    });

    it('has languages array', () => {
      expect(webappNavigation.languages).toBeInstanceOf(Array);
      expect(webappNavigation.languages.length).toBeGreaterThan(0);
    });

    it('has categories array', () => {
      expect(webappNavigation.categories).toBeInstanceOf(Array);
      expect(webappNavigation.categories.length).toBeGreaterThan(0);
    });
  });

  describe('webappShopData', () => {
    it('has correct shop structure', () => {
      expect(webappShopData.name).toBeDefined();
      expect(webappShopData.description).toBeDefined();
      expect(webappShopData.termsOfService).toBeDefined();
      expect(webappShopData.privacyPolicy).toBeDefined();
      expect(webappShopData.refundPolicy).toBeDefined();
      expect(webappShopData.shippingPolicy).toBeDefined();
    });
  });

  describe('webappOrders', () => {
    it('contains expected number of orders', () => {
      expect(webappOrders).toHaveLength(2);
    });

    it('has correct order structure', () => {
      const order = webappOrders[0];
      expect(order.number).toBeDefined();
      expect(order.date).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.totalQuantity).toBeGreaterThan(0);
      expect(order.cost).toBeDefined();
      expect(order.products).toBeInstanceOf(Array);
    });
  });

  describe('webappCart', () => {
    it('has correct cart structure', () => {
      expect(webappCart.id).toBeDefined();
      expect(webappCart.note).toBeDefined();
      expect(webappCart.createdAt).toBeDefined();
      expect(webappCart.totalQuantity).toBeGreaterThan(0);
      expect(webappCart.cost).toBeDefined();
      expect(webappCart.lines).toBeInstanceOf(Array);
    });
  });

  describe('webappGroupCollections', () => {
    it('contains expected number of group collections', () => {
      expect(webappGroupCollections).toHaveLength(6);
    });

    it('has correct group collection structure', () => {
      const groupCollection = webappGroupCollections[0];
      expect(groupCollection.id).toBeDefined();
      expect(groupCollection.title).toBeDefined();
      expect(groupCollection.handle).toBeDefined();
      expect(groupCollection.description).toBeDefined();
      expect(groupCollection.iconSvg).toBeDefined();
      expect(groupCollection.collections).toBeInstanceOf(Array);
    });
  });
});
