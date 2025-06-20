import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberCreateWithoutOrganizationInputSchema } from './MemberCreateWithoutOrganizationInputSchema';
import { MemberUncheckedCreateWithoutOrganizationInputSchema } from './MemberUncheckedCreateWithoutOrganizationInputSchema';
import { MemberCreateOrConnectWithoutOrganizationInputSchema } from './MemberCreateOrConnectWithoutOrganizationInputSchema';
import { MemberCreateManyOrganizationInputEnvelopeSchema } from './MemberCreateManyOrganizationInputEnvelopeSchema';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';

export const MemberCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberCreateNestedManyWithoutOrganizationInput> = z.object({
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberCreateWithoutOrganizationInputSchema).array(),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => MemberCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => MemberCreateManyOrganizationInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => MemberWhereUniqueInputSchema),z.lazy(() => MemberWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default MemberCreateNestedManyWithoutOrganizationInputSchema;
