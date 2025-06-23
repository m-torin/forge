import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomSelectSchema } from '../inputTypeSchemas/FandomSelectSchema';
import { FandomIncludeSchema } from '../inputTypeSchemas/FandomIncludeSchema';

export const FandomArgsSchema: z.ZodType<Prisma.FandomDefaultArgs> = z
  .object({
    select: z.lazy(() => FandomSelectSchema).optional(),
    include: z.lazy(() => FandomIncludeSchema).optional(),
  })
  .strict();

export default FandomArgsSchema;
