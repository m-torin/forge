import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutOrganizationInputSchema } from './TeamCreateWithoutOrganizationInputSchema';
import { TeamUncheckedCreateWithoutOrganizationInputSchema } from './TeamUncheckedCreateWithoutOrganizationInputSchema';
import { TeamCreateOrConnectWithoutOrganizationInputSchema } from './TeamCreateOrConnectWithoutOrganizationInputSchema';
import { TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema } from './TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema';
import { TeamCreateManyOrganizationInputEnvelopeSchema } from './TeamCreateManyOrganizationInputEnvelopeSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema } from './TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema';
import { TeamUpdateManyWithWhereWithoutOrganizationInputSchema } from './TeamUpdateManyWithWhereWithoutOrganizationInputSchema';
import { TeamScalarWhereInputSchema } from './TeamScalarWhereInputSchema';

export const TeamUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.TeamUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => TeamCreateWithoutOrganizationInputSchema),z.lazy(() => TeamCreateWithoutOrganizationInputSchema).array(),z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => TeamUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TeamCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => TeamCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => TeamUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TeamCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TeamWhereUniqueInputSchema),z.lazy(() => TeamWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TeamWhereUniqueInputSchema),z.lazy(() => TeamWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TeamWhereUniqueInputSchema),z.lazy(() => TeamWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TeamWhereUniqueInputSchema),z.lazy(() => TeamWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => TeamUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TeamUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => TeamUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TeamScalarWhereInputSchema),z.lazy(() => TeamScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TeamUpdateManyWithoutOrganizationNestedInputSchema;
