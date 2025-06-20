import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastCreateManyInputSchema } from '../inputTypeSchemas/CastCreateManyInputSchema'

export const CastCreateManyArgsSchema: z.ZodType<Prisma.CastCreateManyArgs> = z.object({
  data: z.union([ CastCreateManyInputSchema,CastCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CastCreateManyArgsSchema;
