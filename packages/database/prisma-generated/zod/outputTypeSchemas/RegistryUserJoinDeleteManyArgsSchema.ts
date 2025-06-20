import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinWhereInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereInputSchema'

export const RegistryUserJoinDeleteManyArgsSchema: z.ZodType<Prisma.RegistryUserJoinDeleteManyArgs> = z.object({
  where: RegistryUserJoinWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default RegistryUserJoinDeleteManyArgsSchema;
