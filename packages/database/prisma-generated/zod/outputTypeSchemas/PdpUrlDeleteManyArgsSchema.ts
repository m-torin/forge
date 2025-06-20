import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlWhereInputSchema } from '../inputTypeSchemas/PdpUrlWhereInputSchema'

export const PdpUrlDeleteManyArgsSchema: z.ZodType<Prisma.PdpUrlDeleteManyArgs> = z.object({
  where: PdpUrlWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PdpUrlDeleteManyArgsSchema;
