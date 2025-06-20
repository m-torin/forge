import type { Prisma } from '../../client';

import { z } from 'zod';

export const MemberUncheckedCreateInputSchema: z.ZodType<Prisma.MemberUncheckedCreateInput> = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export default MemberUncheckedCreateInputSchema;
