import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationSelectSchema } from '../inputTypeSchemas/InvitationSelectSchema';
import { InvitationIncludeSchema } from '../inputTypeSchemas/InvitationIncludeSchema';

export const InvitationArgsSchema: z.ZodType<Prisma.InvitationDefaultArgs> = z.object({
  select: z.lazy(() => InvitationSelectSchema).optional(),
  include: z.lazy(() => InvitationIncludeSchema).optional(),
}).strict();

export default InvitationArgsSchema;
