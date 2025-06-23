import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationWhereInputSchema } from '../inputTypeSchemas/InvitationWhereInputSchema';
import { InvitationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/InvitationOrderByWithAggregationInputSchema';
import { InvitationScalarFieldEnumSchema } from '../inputTypeSchemas/InvitationScalarFieldEnumSchema';
import { InvitationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/InvitationScalarWhereWithAggregatesInputSchema';

export const InvitationGroupByArgsSchema: z.ZodType<Prisma.InvitationGroupByArgs> = z
  .object({
    where: InvitationWhereInputSchema.optional(),
    orderBy: z
      .union([
        InvitationOrderByWithAggregationInputSchema.array(),
        InvitationOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: InvitationScalarFieldEnumSchema.array(),
    having: InvitationScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default InvitationGroupByArgsSchema;
