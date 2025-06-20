import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationCreateWithoutOrganizationInputSchema } from './InvitationCreateWithoutOrganizationInputSchema';
import { InvitationUncheckedCreateWithoutOrganizationInputSchema } from './InvitationUncheckedCreateWithoutOrganizationInputSchema';

export const InvitationCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => InvitationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export default InvitationCreateOrConnectWithoutOrganizationInputSchema;
