import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithoutOrganizationInputSchema } from './MemberUpdateWithoutOrganizationInputSchema';
import { MemberUncheckedUpdateWithoutOrganizationInputSchema } from './MemberUncheckedUpdateWithoutOrganizationInputSchema';

export const MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpdateWithWhereUniqueWithoutOrganizationInput> =
  z
    .object({
      where: z.lazy(() => MemberWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MemberUpdateWithoutOrganizationInputSchema),
        z.lazy(() => MemberUncheckedUpdateWithoutOrganizationInputSchema),
      ]),
    })
    .strict();

export default MemberUpdateWithWhereUniqueWithoutOrganizationInputSchema;
