import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressWhereInputSchema } from '../inputTypeSchemas/AddressWhereInputSchema';
import { AddressOrderByWithRelationInputSchema } from '../inputTypeSchemas/AddressOrderByWithRelationInputSchema';
import { AddressWhereUniqueInputSchema } from '../inputTypeSchemas/AddressWhereUniqueInputSchema';

export const AddressAggregateArgsSchema: z.ZodType<Prisma.AddressAggregateArgs> = z
  .object({
    where: AddressWhereInputSchema.optional(),
    orderBy: z
      .union([AddressOrderByWithRelationInputSchema.array(), AddressOrderByWithRelationInputSchema])
      .optional(),
    cursor: AddressWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default AddressAggregateArgsSchema;
