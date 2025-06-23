import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandCreateManyInputSchema } from '../inputTypeSchemas/BrandCreateManyInputSchema';

export const BrandCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BrandCreateManyAndReturnArgs> = z
  .object({
    data: z.union([BrandCreateManyInputSchema, BrandCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default BrandCreateManyAndReturnArgsSchema;
