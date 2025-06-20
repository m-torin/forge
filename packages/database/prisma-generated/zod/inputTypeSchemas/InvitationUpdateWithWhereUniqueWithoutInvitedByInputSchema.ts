import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutInvitedByInputSchema } from './InvitationUpdateWithoutInvitedByInputSchema';
import { InvitationUncheckedUpdateWithoutInvitedByInputSchema } from './InvitationUncheckedUpdateWithoutInvitedByInputSchema';

export const InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationUpdateWithWhereUniqueWithoutInvitedByInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InvitationUpdateWithoutInvitedByInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutInvitedByInputSchema) ]),
}).strict();

export default InvitationUpdateWithWhereUniqueWithoutInvitedByInputSchema;
