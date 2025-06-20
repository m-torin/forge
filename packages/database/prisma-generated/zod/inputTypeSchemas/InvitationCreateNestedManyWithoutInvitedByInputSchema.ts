import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutInvitedByInputSchema } from './InvitationCreateWithoutInvitedByInputSchema';
import { InvitationUncheckedCreateWithoutInvitedByInputSchema } from './InvitationUncheckedCreateWithoutInvitedByInputSchema';
import { InvitationCreateOrConnectWithoutInvitedByInputSchema } from './InvitationCreateOrConnectWithoutInvitedByInputSchema';
import { InvitationCreateManyInvitedByInputEnvelopeSchema } from './InvitationCreateManyInvitedByInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';

export const InvitationCreateNestedManyWithoutInvitedByInputSchema: z.ZodType<Prisma.InvitationCreateNestedManyWithoutInvitedByInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutInvitedByInputSchema),z.lazy(() => InvitationCreateWithoutInvitedByInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutInvitedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutInvitedByInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutInvitedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyInvitedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default InvitationCreateNestedManyWithoutInvitedByInputSchema;
