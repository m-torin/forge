import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutInvitedByInputSchema } from './InvitationUpdateWithoutInvitedByInputSchema';
import { InvitationUncheckedUpdateWithoutInvitedByInputSchema } from './InvitationUncheckedUpdateWithoutInvitedByInputSchema';
import { InvitationCreateWithoutInvitedByInputSchema } from './InvitationCreateWithoutInvitedByInputSchema';
import { InvitationUncheckedCreateWithoutInvitedByInputSchema } from './InvitationUncheckedCreateWithoutInvitedByInputSchema';

export const InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationUpsertWithWhereUniqueWithoutInvitedByInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InvitationUpdateWithoutInvitedByInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutInvitedByInputSchema) ]),
  create: z.union([ z.lazy(() => InvitationCreateWithoutInvitedByInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema) ]),
}).strict();

export default InvitationUpsertWithWhereUniqueWithoutInvitedByInputSchema;
