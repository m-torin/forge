import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';
import { InvitationUpdateManyMutationInputSchema } from './InvitationUpdateManyMutationInputSchema';
import { InvitationUncheckedUpdateManyWithoutInvitedByInputSchema } from './InvitationUncheckedUpdateManyWithoutInvitedByInputSchema';

export const InvitationUpdateManyWithWhereWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationUpdateManyWithWhereWithoutInvitedByInput> = z.object({
  where: z.lazy(() => InvitationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateManyMutationInputSchema),z.lazy(() => InvitationUncheckedUpdateManyWithoutInvitedByInputSchema) ]),
}).strict();

export default InvitationUpdateManyWithWhereWithoutInvitedByInputSchema;
