import { z } from 'zod';
import type { Prisma } from '../../client';
import { SessionIncludeSchema } from '../inputTypeSchemas/SessionIncludeSchema';
import { SessionWhereUniqueInputSchema } from '../inputTypeSchemas/SessionWhereUniqueInputSchema';
import { SessionCreateInputSchema } from '../inputTypeSchemas/SessionCreateInputSchema';
import { SessionUncheckedCreateInputSchema } from '../inputTypeSchemas/SessionUncheckedCreateInputSchema';
import { SessionUpdateInputSchema } from '../inputTypeSchemas/SessionUpdateInputSchema';
import { SessionUncheckedUpdateInputSchema } from '../inputTypeSchemas/SessionUncheckedUpdateInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z
  .object({
    id: z.boolean().optional(),
    expiresAt: z.boolean().optional(),
    token: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    ipAddress: z.boolean().optional(),
    userAgent: z.boolean().optional(),
    userId: z.boolean().optional(),
    activeOrganizationId: z.boolean().optional(),
    impersonatedBy: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
  })
  .strict();

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z
  .object({
    select: SessionSelectSchema.optional(),
    include: z.lazy(() => SessionIncludeSchema).optional(),
    where: SessionWhereUniqueInputSchema,
    create: z.union([SessionCreateInputSchema, SessionUncheckedCreateInputSchema]),
    update: z.union([SessionUpdateInputSchema, SessionUncheckedUpdateInputSchema]),
  })
  .strict();

export default SessionUpsertArgsSchema;
