import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamScalarWhereInputSchema } from './TeamScalarWhereInputSchema';
import { TeamUpdateManyMutationInputSchema } from './TeamUpdateManyMutationInputSchema';
import { TeamUncheckedUpdateManyWithoutOrganizationInputSchema } from './TeamUncheckedUpdateManyWithoutOrganizationInputSchema';

export const TeamUpdateManyWithWhereWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamUpdateManyWithWhereWithoutOrganizationInput> = z.object({
  where: z.lazy(() => TeamScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TeamUpdateManyMutationInputSchema),z.lazy(() => TeamUncheckedUpdateManyWithoutOrganizationInputSchema) ]),
}).strict();

export default TeamUpdateManyWithWhereWithoutOrganizationInputSchema;
