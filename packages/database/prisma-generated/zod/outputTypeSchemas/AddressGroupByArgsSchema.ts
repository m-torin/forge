import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressWhereInputSchema } from '../inputTypeSchemas/AddressWhereInputSchema'
import { AddressOrderByWithAggregationInputSchema } from '../inputTypeSchemas/AddressOrderByWithAggregationInputSchema'
import { AddressScalarFieldEnumSchema } from '../inputTypeSchemas/AddressScalarFieldEnumSchema'
import { AddressScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/AddressScalarWhereWithAggregatesInputSchema'

export const AddressGroupByArgsSchema: z.ZodType<Prisma.AddressGroupByArgs> = z.object({
  where: AddressWhereInputSchema.optional(),
  orderBy: z.union([ AddressOrderByWithAggregationInputSchema.array(),AddressOrderByWithAggregationInputSchema ]).optional(),
  by: AddressScalarFieldEnumSchema.array(),
  having: AddressScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default AddressGroupByArgsSchema;
