import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressUpdateManyMutationInputSchema } from '../inputTypeSchemas/AddressUpdateManyMutationInputSchema'
import { AddressUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/AddressUncheckedUpdateManyInputSchema'
import { AddressWhereInputSchema } from '../inputTypeSchemas/AddressWhereInputSchema'

export const AddressUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.AddressUpdateManyAndReturnArgs> = z.object({
  data: z.union([ AddressUpdateManyMutationInputSchema,AddressUncheckedUpdateManyInputSchema ]),
  where: AddressWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default AddressUpdateManyAndReturnArgsSchema;
