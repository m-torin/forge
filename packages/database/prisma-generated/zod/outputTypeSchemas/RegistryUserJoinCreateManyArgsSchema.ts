import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinCreateManyInputSchema } from '../inputTypeSchemas/RegistryUserJoinCreateManyInputSchema'

export const RegistryUserJoinCreateManyArgsSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyArgs> = z.object({
  data: z.union([ RegistryUserJoinCreateManyInputSchema,RegistryUserJoinCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RegistryUserJoinCreateManyArgsSchema;
