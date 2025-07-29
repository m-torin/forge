import { ModelValidationRules, countSet, exactlyOneSet } from './types';

export const validationRules: ModelValidationRules = {
  // Review validations
  review: {
    create: [
      {
        field: 'rating',
        validate: (value: number) => value >= 1 && value <= 5,
        message: (value: number) => `Rating must be between 1 and 5, got ${value}`,
      },
    ],
    update: [
      {
        field: 'rating',
        validate: (value: number) => value >= 1 && value <= 5,
        message: (value: number) => `Rating must be between 1 and 5, got ${value}`,
      },
    ],
  },

  // CartItem validations
  cartItem: {
    create: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
      {
        field: 'price',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
    ],
    update: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
      {
        field: 'price',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
    ],
  },

  // OrderItem validations
  orderItem: {
    create: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
      {
        field: 'price',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
      {
        field: 'total',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Total cannot be negative, got ${value}`,
      },
    ],
    update: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
      {
        field: 'price',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
      {
        field: 'total',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Total cannot be negative, got ${value}`,
      },
    ],
  },

  // Product validations
  product: {
    create: [
      {
        field: 'price',
        validate: (value: number | null) => value === null || value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
    ],
    update: [
      {
        field: 'price',
        validate: (value: number | null) => value === null || value >= 0,
        message: (value: number) => `Price cannot be negative, got ${value}`,
      },
    ],
  },

  // RegistryItem validations
  registryItem: {
    create: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
      {
        field: '_polymorphic',
        validate: (data: any) => exactlyOneSet(data, ['productId', 'collectionId']),
        message: () => 'Exactly one of productId or collectionId must be set',
      },
    ],
    update: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
    ],
  },

  // RegistryPurchaseJoin validations
  registryPurchaseJoin: {
    create: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
    ],
    update: [
      {
        field: 'quantity',
        validate: (value: number) => value > 0,
        message: (value: number) => `Quantity must be positive, got ${value}`,
      },
    ],
  },

  // Media validations - polymorphic relationships
  media: {
    create: [
      {
        field: '_polymorphic',
        validate: (data: any) => {
          const fields = [
            'articleId',
            'brandId',
            'collectionId',
            'productId',
            'taxonomyId',
            'categoryId',
            'pdpJoinId',
            'reviewId',
          ];
          return exactlyOneSet(data, fields);
        },
        message: (data: any) => {
          const fields = [
            'articleId',
            'brandId',
            'collectionId',
            'productId',
            'taxonomyId',
            'categoryId',
            'pdpJoinId',
            'reviewId',
          ];
          const count = countSet(data, fields);
          return `Exactly one foreign key must be set for Media. Found ${count} set.`;
        },
      },
    ],
  },

  // ProductIdentifiers validations - polymorphic relationships
  productIdentifiers: {
    create: [
      {
        field: '_polymorphic',
        validate: (data: any) => {
          const fields = ['productId', 'pdpJoinId', 'collectionId', 'brandId'];
          return exactlyOneSet(data, fields);
        },
        message: (data: any) => {
          const fields = ['productId', 'pdpJoinId', 'collectionId', 'brandId'];
          const count = countSet(data, fields);
          return `Exactly one foreign key must be set for ProductIdentifiers. Found ${count} set.`;
        },
      },
    ],
  },

  // FavoriteJoin validations - polymorphic relationships
  favoriteJoin: {
    create: [
      {
        field: '_polymorphic',
        validate: (data: any) => {
          const fields = ['productId', 'collectionId'];
          return exactlyOneSet(data, fields);
        },
        message: (data: any) => {
          const fields = ['productId', 'collectionId'];
          const count = countSet(data, fields);
          return `Exactly one of productId or collectionId must be set for FavoriteJoin. Found ${count} set.`;
        },
      },
    ],
  },
};
