import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutTeamInputSchema } from './InvitationUpdateWithoutTeamInputSchema';
import { InvitationUncheckedUpdateWithoutTeamInputSchema } from './InvitationUncheckedUpdateWithoutTeamInputSchema';
import { InvitationCreateWithoutTeamInputSchema } from './InvitationCreateWithoutTeamInputSchema';
import { InvitationUncheckedCreateWithoutTeamInputSchema } from './InvitationUncheckedCreateWithoutTeamInputSchema';

export const InvitationUpsertWithWhereUniqueWithoutTeamInputSchema: z.ZodType<Prisma.InvitationUpsertWithWhereUniqueWithoutTeamInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InvitationUpdateWithoutTeamInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutTeamInputSchema) ]),
  create: z.union([ z.lazy(() => InvitationCreateWithoutTeamInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema) ]),
}).strict();

export default InvitationUpsertWithWhereUniqueWithoutTeamInputSchema;
