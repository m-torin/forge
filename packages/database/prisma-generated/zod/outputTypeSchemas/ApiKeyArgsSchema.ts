import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeySelectSchema } from '../inputTypeSchemas/ApiKeySelectSchema';
import { ApiKeyIncludeSchema } from '../inputTypeSchemas/ApiKeyIncludeSchema';

export const ApiKeyArgsSchema: z.ZodType<Prisma.ApiKeyDefaultArgs> = z
  .object({
    select: z.lazy(() => ApiKeySelectSchema).optional(),
    include: z.lazy(() => ApiKeyIncludeSchema).optional(),
  })
  .strict();

export default ApiKeyArgsSchema;
