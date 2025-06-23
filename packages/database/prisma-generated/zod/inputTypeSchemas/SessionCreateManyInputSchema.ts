import type { Prisma } from '../../client';

import { z } from 'zod';

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z
  .object({
    id: z.string(),
    expiresAt: z.coerce.date(),
    token: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    ipAddress: z.string().optional().nullable(),
    userAgent: z.string().optional().nullable(),
    userId: z.string(),
    activeOrganizationId: z.string().optional().nullable(),
    impersonatedBy: z.string().optional().nullable(),
  })
  .strict();

export default SessionCreateManyInputSchema;
