import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastWhereInputSchema } from '../inputTypeSchemas/CastWhereInputSchema';

export const CastDeleteManyArgsSchema: z.ZodType<Prisma.CastDeleteManyArgs> = z
  .object({
    where: CastWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default CastDeleteManyArgsSchema;
