import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { Prisma } from '../../client';
import { ProductStatusSchema } from '../inputTypeSchemas/ProductStatusSchema';
import { ProductTypeSchema } from '../inputTypeSchemas/ProductTypeSchema';

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  status: ProductStatusSchema,
  type: ProductTypeSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  category: z.string(),
  brand: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  variantPrice: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'variantPrice' must be a Decimal. Location: ['Models', 'Product']",
    })
    .nullable(),
  compareAtPrice: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'compareAtPrice' must be a Decimal. Location: ['Models', 'Product']",
    })
    .nullable(),
  physicalProperties: JsonValueSchema.nullable(),
  displayOrder: z.number().int(),
  isDefault: z.boolean(),
  copy: JsonValueSchema,
  attributes: JsonValueSchema,
  parentId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  aiGenerated: z.boolean(),
  aiConfidence: z.number().nullable(),
  aiSources: z.string().array(),
});

export type Product = z.infer<typeof ProductSchema>;

export default ProductSchema;
