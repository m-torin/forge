import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';
import { ProductTypeSchema } from './ProductTypeSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { ProductCreateaiSourcesInputSchema } from './ProductCreateaiSourcesInputSchema';

export const ProductCreateManyInputSchema: z.ZodType<Prisma.ProductCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    category: z.string(),
    status: z.lazy(() => ProductStatusSchema).optional(),
    brand: z.string().optional().nullable(),
    price: z.number().optional().nullable(),
    currency: z.string().optional().nullable(),
    type: z.lazy(() => ProductTypeSchema).optional(),
    variantPrice: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional()
      .nullable(),
    compareAtPrice: z
      .union([
        z.number(),
        z.string(),
        z.instanceof(Decimal),
        z.instanceof(Prisma.Decimal),
        DecimalJsLikeSchema,
      ])
      .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
      .optional()
      .nullable(),
    physicalProperties: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    displayOrder: z.number().int().optional(),
    isDefault: z.boolean().optional(),
    copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
    attributes: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
    parentId: z.string().optional().nullable(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    createdBy: z.string().optional().nullable(),
    deletedAt: z.coerce.date().optional().nullable(),
    deletedById: z.string().optional().nullable(),
    aiGenerated: z.boolean().optional(),
    aiConfidence: z.number().optional().nullable(),
    aiSources: z
      .union([z.lazy(() => ProductCreateaiSourcesInputSchema), z.string().array()])
      .optional(),
  })
  .strict();

export default ProductCreateManyInputSchema;
