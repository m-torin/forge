import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomCreateManyInputSchema } from '../inputTypeSchemas/FandomCreateManyInputSchema'

export const FandomCreateManyArgsSchema: z.ZodType<Prisma.FandomCreateManyArgs> = z.object({
  data: z.union([ FandomCreateManyInputSchema,FandomCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default FandomCreateManyArgsSchema;
