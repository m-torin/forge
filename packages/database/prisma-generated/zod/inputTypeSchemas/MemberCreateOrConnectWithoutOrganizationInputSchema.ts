import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberCreateWithoutOrganizationInputSchema } from './MemberCreateWithoutOrganizationInputSchema';
import { MemberUncheckedCreateWithoutOrganizationInputSchema } from './MemberUncheckedCreateWithoutOrganizationInputSchema';

export const MemberCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export default MemberCreateOrConnectWithoutOrganizationInputSchema;
