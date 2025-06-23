import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutOrganizationInputSchema } from './TeamCreateWithoutOrganizationInputSchema';
import { TeamUncheckedCreateWithoutOrganizationInputSchema } from './TeamUncheckedCreateWithoutOrganizationInputSchema';
import { TeamCreateOrConnectWithoutOrganizationInputSchema } from './TeamCreateOrConnectWithoutOrganizationInputSchema';
import { TeamCreateManyOrganizationInputEnvelopeSchema } from './TeamCreateManyOrganizationInputEnvelopeSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';

export const TeamCreateNestedManyWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamCreateNestedManyWithoutOrganizationInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamCreateWithoutOrganizationInputSchema),
          z.lazy(() => TeamCreateWithoutOrganizationInputSchema).array(),
          z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema),
          z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => TeamCreateOrConnectWithoutOrganizationInputSchema),
          z.lazy(() => TeamCreateOrConnectWithoutOrganizationInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => TeamCreateManyOrganizationInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => TeamWhereUniqueInputSchema),
          z.lazy(() => TeamWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TeamCreateNestedManyWithoutOrganizationInputSchema;
