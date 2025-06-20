import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUpdateManyMutationInputSchema } from '../inputTypeSchemas/RegistryUpdateManyMutationInputSchema'
import { RegistryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RegistryUncheckedUpdateManyInputSchema'
import { RegistryWhereInputSchema } from '../inputTypeSchemas/RegistryWhereInputSchema'

export const RegistryUpdateManyArgsSchema: z.ZodType<Prisma.RegistryUpdateManyArgs> = z.object({
  data: z.union([ RegistryUpdateManyMutationInputSchema,RegistryUncheckedUpdateManyInputSchema ]),
  where: RegistryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default RegistryUpdateManyArgsSchema;
