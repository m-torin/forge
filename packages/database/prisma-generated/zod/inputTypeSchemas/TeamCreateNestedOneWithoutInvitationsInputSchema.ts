import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutInvitationsInputSchema } from './TeamCreateWithoutInvitationsInputSchema';
import { TeamUncheckedCreateWithoutInvitationsInputSchema } from './TeamUncheckedCreateWithoutInvitationsInputSchema';
import { TeamCreateOrConnectWithoutInvitationsInputSchema } from './TeamCreateOrConnectWithoutInvitationsInputSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';

export const TeamCreateNestedOneWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamCreateNestedOneWithoutInvitationsInput> = z.object({
  create: z.union([ z.lazy(() => TeamCreateWithoutInvitationsInputSchema),z.lazy(() => TeamUncheckedCreateWithoutInvitationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TeamCreateOrConnectWithoutInvitationsInputSchema).optional(),
  connect: z.lazy(() => TeamWhereUniqueInputSchema).optional()
}).strict();

export default TeamCreateNestedOneWithoutInvitationsInputSchema;
