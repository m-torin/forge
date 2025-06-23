import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamUpdateWithoutOrganizationInputSchema } from './TeamUpdateWithoutOrganizationInputSchema';
import { TeamUncheckedUpdateWithoutOrganizationInputSchema } from './TeamUncheckedUpdateWithoutOrganizationInputSchema';
import { TeamCreateWithoutOrganizationInputSchema } from './TeamCreateWithoutOrganizationInputSchema';
import { TeamUncheckedCreateWithoutOrganizationInputSchema } from './TeamUncheckedCreateWithoutOrganizationInputSchema';

export const TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamUpsertWithWhereUniqueWithoutOrganizationInput> =
  z
    .object({
      where: z.lazy(() => TeamWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TeamUpdateWithoutOrganizationInputSchema),
        z.lazy(() => TeamUncheckedUpdateWithoutOrganizationInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TeamCreateWithoutOrganizationInputSchema),
        z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema),
      ]),
    })
    .strict();

export default TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema;
