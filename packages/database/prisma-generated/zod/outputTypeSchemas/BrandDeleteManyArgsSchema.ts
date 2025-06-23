import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandWhereInputSchema } from '../inputTypeSchemas/BrandWhereInputSchema';

export const BrandDeleteManyArgsSchema: z.ZodType<Prisma.BrandDeleteManyArgs> = z
  .object({
    where: BrandWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default BrandDeleteManyArgsSchema;
