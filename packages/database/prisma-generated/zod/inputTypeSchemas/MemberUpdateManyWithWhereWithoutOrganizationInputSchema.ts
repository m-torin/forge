import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberScalarWhereInputSchema } from './MemberScalarWhereInputSchema';
import { MemberUpdateManyMutationInputSchema } from './MemberUpdateManyMutationInputSchema';
import { MemberUncheckedUpdateManyWithoutOrganizationInputSchema } from './MemberUncheckedUpdateManyWithoutOrganizationInputSchema';

export const MemberUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.MemberUpdateManyWithWhereWithoutOrganizationInput> =
  z
    .object({
      where: z.lazy(() => MemberScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MemberUpdateManyMutationInputSchema),
        z.lazy(() => MemberUncheckedUpdateManyWithoutOrganizationInputSchema),
      ]),
    })
    .strict();

export default MemberUpdateManyWithWhereWithoutOrganizationInputSchema;
