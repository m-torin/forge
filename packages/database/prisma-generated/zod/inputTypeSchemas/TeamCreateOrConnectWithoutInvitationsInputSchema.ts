import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamCreateWithoutInvitationsInputSchema } from './TeamCreateWithoutInvitationsInputSchema';
import { TeamUncheckedCreateWithoutInvitationsInputSchema } from './TeamUncheckedCreateWithoutInvitationsInputSchema';

export const TeamCreateOrConnectWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamCreateOrConnectWithoutInvitationsInput> = z.object({
  where: z.lazy(() => TeamWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeamCreateWithoutInvitationsInputSchema),z.lazy(() => TeamUncheckedCreateWithoutInvitationsInputSchema) ]),
}).strict();

export default TeamCreateOrConnectWithoutInvitationsInputSchema;
