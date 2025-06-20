import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutTeamInputSchema } from './InvitationCreateWithoutTeamInputSchema';
import { InvitationUncheckedCreateWithoutTeamInputSchema } from './InvitationUncheckedCreateWithoutTeamInputSchema';
import { InvitationCreateOrConnectWithoutTeamInputSchema } from './InvitationCreateOrConnectWithoutTeamInputSchema';
import { InvitationUpsertWithWhereUniqueWithoutTeamInputSchema } from './InvitationUpsertWithWhereUniqueWithoutTeamInputSchema';
import { InvitationCreateManyTeamInputEnvelopeSchema } from './InvitationCreateManyTeamInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithWhereUniqueWithoutTeamInputSchema } from './InvitationUpdateWithWhereUniqueWithoutTeamInputSchema';
import { InvitationUpdateManyWithWhereWithoutTeamInputSchema } from './InvitationUpdateManyWithWhereWithoutTeamInputSchema';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';

export const InvitationUncheckedUpdateManyWithoutTeamNestedInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutTeamNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutTeamInputSchema),z.lazy(() => InvitationCreateWithoutTeamInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutTeamInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutTeamInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutTeamInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutTeamInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyTeamInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutTeamInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutTeamInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutTeamInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutTeamInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default InvitationUncheckedUpdateManyWithoutTeamNestedInputSchema;
