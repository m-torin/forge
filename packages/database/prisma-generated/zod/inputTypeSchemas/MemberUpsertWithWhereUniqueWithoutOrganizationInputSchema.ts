import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithoutOrganizationInputSchema } from './MemberUpdateWithoutOrganizationInputSchema';
import { MemberUncheckedUpdateWithoutOrganizationInputSchema } from './MemberUncheckedUpdateWithoutOrganizationInputSchema';
import { MemberCreateWithoutOrganizationInputSchema } from './MemberCreateWithoutOrganizationInputSchema';
import { MemberUncheckedCreateWithoutOrganizationInputSchema } from './MemberUncheckedCreateWithoutOrganizationInputSchema';

export const MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpsertWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => MemberUpdateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutOrganizationInputSchema) ]),
  create: z.union([ z.lazy(() => MemberCreateWithoutOrganizationInputSchema),z.lazy(() => MemberUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export default MemberUpsertWithWhereUniqueWithoutOrganizationInputSchema;
