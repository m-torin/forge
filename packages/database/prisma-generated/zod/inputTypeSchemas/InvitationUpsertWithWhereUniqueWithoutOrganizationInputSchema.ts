import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutOrganizationInputSchema } from './InvitationUpdateWithoutOrganizationInputSchema';
import { InvitationUncheckedUpdateWithoutOrganizationInputSchema } from './InvitationUncheckedUpdateWithoutOrganizationInputSchema';
import { InvitationCreateWithoutOrganizationInputSchema } from './InvitationCreateWithoutOrganizationInputSchema';
import { InvitationUncheckedCreateWithoutOrganizationInputSchema } from './InvitationUncheckedCreateWithoutOrganizationInputSchema';

export const InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InvitationUpdateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export default InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema;
