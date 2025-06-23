import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutInvitationsInputSchema } from './TeamCreateWithoutInvitationsInputSchema';
import { TeamUncheckedCreateWithoutInvitationsInputSchema } from './TeamUncheckedCreateWithoutInvitationsInputSchema';
import { TeamCreateOrConnectWithoutInvitationsInputSchema } from './TeamCreateOrConnectWithoutInvitationsInputSchema';
import { TeamUpsertWithoutInvitationsInputSchema } from './TeamUpsertWithoutInvitationsInputSchema';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamUpdateToOneWithWhereWithoutInvitationsInputSchema } from './TeamUpdateToOneWithWhereWithoutInvitationsInputSchema';
import { TeamUpdateWithoutInvitationsInputSchema } from './TeamUpdateWithoutInvitationsInputSchema';
import { TeamUncheckedUpdateWithoutInvitationsInputSchema } from './TeamUncheckedUpdateWithoutInvitationsInputSchema';

export const TeamUpdateOneWithoutInvitationsNestedInputSchema: z.ZodType<Prisma.TeamUpdateOneWithoutInvitationsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamCreateWithoutInvitationsInputSchema),
          z.lazy(() => TeamUncheckedCreateWithoutInvitationsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TeamCreateOrConnectWithoutInvitationsInputSchema).optional(),
      upsert: z.lazy(() => TeamUpsertWithoutInvitationsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => TeamWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => TeamWhereInputSchema)]).optional(),
      connect: z.lazy(() => TeamWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => TeamUpdateToOneWithWhereWithoutInvitationsInputSchema),
          z.lazy(() => TeamUpdateWithoutInvitationsInputSchema),
          z.lazy(() => TeamUncheckedUpdateWithoutInvitationsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default TeamUpdateOneWithoutInvitationsNestedInputSchema;
