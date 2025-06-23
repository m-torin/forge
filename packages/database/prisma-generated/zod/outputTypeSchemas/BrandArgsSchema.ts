import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandSelectSchema } from '../inputTypeSchemas/BrandSelectSchema';
import { BrandIncludeSchema } from '../inputTypeSchemas/BrandIncludeSchema';

export const BrandArgsSchema: z.ZodType<Prisma.BrandDefaultArgs> = z
  .object({
    select: z.lazy(() => BrandSelectSchema).optional(),
    include: z.lazy(() => BrandIncludeSchema).optional(),
  })
  .strict();

export default BrandArgsSchema;
