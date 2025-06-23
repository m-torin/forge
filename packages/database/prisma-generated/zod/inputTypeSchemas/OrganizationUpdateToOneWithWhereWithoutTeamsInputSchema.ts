import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';
import { OrganizationUpdateWithoutTeamsInputSchema } from './OrganizationUpdateWithoutTeamsInputSchema';
import { OrganizationUncheckedUpdateWithoutTeamsInputSchema } from './OrganizationUncheckedUpdateWithoutTeamsInputSchema';

export const OrganizationUpdateToOneWithWhereWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationUpdateToOneWithWhereWithoutTeamsInput> =
  z
    .object({
      where: z.lazy(() => OrganizationWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => OrganizationUpdateWithoutTeamsInputSchema),
        z.lazy(() => OrganizationUncheckedUpdateWithoutTeamsInputSchema),
      ]),
    })
    .strict();

export default OrganizationUpdateToOneWithWhereWithoutTeamsInputSchema;
