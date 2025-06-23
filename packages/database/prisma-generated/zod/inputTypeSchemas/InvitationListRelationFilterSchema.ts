import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereInputSchema } from './InvitationWhereInputSchema';

export const InvitationListRelationFilterSchema: z.ZodType<Prisma.InvitationListRelationFilter> = z
  .object({
    every: z.lazy(() => InvitationWhereInputSchema).optional(),
    some: z.lazy(() => InvitationWhereInputSchema).optional(),
    none: z.lazy(() => InvitationWhereInputSchema).optional(),
  })
  .strict();

export default InvitationListRelationFilterSchema;
