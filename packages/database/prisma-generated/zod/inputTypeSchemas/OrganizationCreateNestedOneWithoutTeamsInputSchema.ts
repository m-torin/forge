import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutTeamsInputSchema } from './OrganizationCreateWithoutTeamsInputSchema';
import { OrganizationUncheckedCreateWithoutTeamsInputSchema } from './OrganizationUncheckedCreateWithoutTeamsInputSchema';
import { OrganizationCreateOrConnectWithoutTeamsInputSchema } from './OrganizationCreateOrConnectWithoutTeamsInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';

export const OrganizationCreateNestedOneWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationCreateNestedOneWithoutTeamsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrganizationCreateWithoutTeamsInputSchema),
          z.lazy(() => OrganizationUncheckedCreateWithoutTeamsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutTeamsInputSchema).optional(),
      connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
    })
    .strict();

export default OrganizationCreateNestedOneWithoutTeamsInputSchema;
