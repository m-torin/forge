import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NestedDecimalNullableWithAggregatesFilterSchema } from './NestedDecimalNullableWithAggregatesFilterSchema';
import { NestedIntNullableFilterSchema } from './NestedIntNullableFilterSchema';
import { NestedDecimalNullableFilterSchema } from './NestedDecimalNullableFilterSchema';

export const DecimalNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DecimalNullableWithAggregatesFilter> =
  z
    .object({
      equals: z
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
      in: z
        .union([
          z.number().array(),
          z.string().array(),
          z.instanceof(Decimal).array(),
          z.instanceof(Prisma.Decimal).array(),
          DecimalJsLikeSchema.array(),
        ])
        .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
          message: 'Must be a Decimal',
        })
        .optional()
        .nullable(),
      notIn: z
        .union([
          z.number().array(),
          z.string().array(),
          z.instanceof(Decimal).array(),
          z.instanceof(Prisma.Decimal).array(),
          DecimalJsLikeSchema.array(),
        ])
        .refine((v) => Array.isArray(v) && (v as any[]).every((v) => isValidDecimalInput(v)), {
          message: 'Must be a Decimal',
        })
        .optional()
        .nullable(),
      lt: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
        .optional(),
      lte: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
        .optional(),
      gt: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
        .optional(),
      gte: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' })
        .optional(),
      not: z
        .union([
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
          z.lazy(() => NestedDecimalNullableWithAggregatesFilterSchema),
        ])
        .optional()
        .nullable(),
      _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
      _avg: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
      _sum: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
      _min: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
      _max: z.lazy(() => NestedDecimalNullableFilterSchema).optional(),
    })
    .strict();

export default DecimalNullableWithAggregatesFilterSchema;
