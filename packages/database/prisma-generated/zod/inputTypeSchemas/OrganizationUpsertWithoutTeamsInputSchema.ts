import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationUpdateWithoutTeamsInputSchema } from './OrganizationUpdateWithoutTeamsInputSchema';
import { OrganizationUncheckedUpdateWithoutTeamsInputSchema } from './OrganizationUncheckedUpdateWithoutTeamsInputSchema';
import { OrganizationCreateWithoutTeamsInputSchema } from './OrganizationCreateWithoutTeamsInputSchema';
import { OrganizationUncheckedCreateWithoutTeamsInputSchema } from './OrganizationUncheckedCreateWithoutTeamsInputSchema';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';

export const OrganizationUpsertWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationUpsertWithoutTeamsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => OrganizationUpdateWithoutTeamsInputSchema),
        z.lazy(() => OrganizationUncheckedUpdateWithoutTeamsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => OrganizationCreateWithoutTeamsInputSchema),
        z.lazy(() => OrganizationUncheckedCreateWithoutTeamsInputSchema),
      ]),
      where: z.lazy(() => OrganizationWhereInputSchema).optional(),
    })
    .strict();

export default OrganizationUpsertWithoutTeamsInputSchema;
