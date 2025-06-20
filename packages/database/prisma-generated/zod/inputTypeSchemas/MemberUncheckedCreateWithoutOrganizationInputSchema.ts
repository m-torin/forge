import type { Prisma } from '../../client';

import { z } from 'zod';

export const MemberUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export default MemberUncheckedCreateWithoutOrganizationInputSchema;
