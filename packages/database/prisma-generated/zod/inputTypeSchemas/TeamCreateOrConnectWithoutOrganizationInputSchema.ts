import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamCreateWithoutOrganizationInputSchema } from './TeamCreateWithoutOrganizationInputSchema';
import { TeamUncheckedCreateWithoutOrganizationInputSchema } from './TeamUncheckedCreateWithoutOrganizationInputSchema';

export const TeamCreateOrConnectWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamCreateOrConnectWithoutOrganizationInput> = z.object({
  where: z.lazy(() => TeamWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeamCreateWithoutOrganizationInputSchema),z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema) ]),
}).strict();

export default TeamCreateOrConnectWithoutOrganizationInputSchema;
