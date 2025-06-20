import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutOrganizationInputSchema } from './InvitationCreateWithoutOrganizationInputSchema';
import { InvitationUncheckedCreateWithoutOrganizationInputSchema } from './InvitationUncheckedCreateWithoutOrganizationInputSchema';
import { InvitationCreateOrConnectWithoutOrganizationInputSchema } from './InvitationCreateOrConnectWithoutOrganizationInputSchema';
import { InvitationCreateManyOrganizationInputEnvelopeSchema } from './InvitationCreateManyOrganizationInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';

export const InvitationCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default InvitationCreateNestedManyWithoutOrganizationInputSchema;
