import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressCreateManyInputSchema } from '../inputTypeSchemas/AddressCreateManyInputSchema'

export const AddressCreateManyArgsSchema: z.ZodType<Prisma.AddressCreateManyArgs> = z.object({
  data: z.union([ AddressCreateManyInputSchema,AddressCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default AddressCreateManyArgsSchema;
