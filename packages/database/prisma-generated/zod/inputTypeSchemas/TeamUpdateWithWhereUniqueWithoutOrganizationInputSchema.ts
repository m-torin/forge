import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamUpdateWithoutOrganizationInputSchema } from './TeamUpdateWithoutOrganizationInputSchema';
import { TeamUncheckedUpdateWithoutOrganizationInputSchema } from './TeamUncheckedUpdateWithoutOrganizationInputSchema';

export const TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamUpdateWithWhereUniqueWithoutOrganizationInput> = z.object({
  where: z.lazy(() => TeamWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TeamUpdateWithoutOrganizationInputSchema),z.lazy(() => TeamUncheckedUpdateWithoutOrganizationInputSchema) ]),
}).strict();

export default TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema;
