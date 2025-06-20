import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';
import { InvitationUpdateManyMutationInputSchema } from './InvitationUpdateManyMutationInputSchema';
import { InvitationUncheckedUpdateManyWithoutTeamInputSchema } from './InvitationUncheckedUpdateManyWithoutTeamInputSchema';

export const InvitationUpdateManyWithWhereWithoutTeamInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithWhereWithoutTeamInput> = z.object({
  where: z.lazy(() => InvitationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateManyMutationInputSchema),z.lazy(() => InvitationUncheckedUpdateManyWithoutTeamInputSchema) ]),
}).strict();

export default InvitationUpdateManyWithWhereWithoutTeamInputSchema;
