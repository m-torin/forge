import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateWithoutOrganizationInputSchema } from './InvitationCreateWithoutOrganizationInputSchema';
import { InvitationUncheckedCreateWithoutOrganizationInputSchema } from './InvitationUncheckedCreateWithoutOrganizationInputSchema';
import { InvitationCreateOrConnectWithoutOrganizationInputSchema } from './InvitationCreateOrConnectWithoutOrganizationInputSchema';
import { InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema } from './InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema';
import { InvitationCreateManyOrganizationInputEnvelopeSchema } from './InvitationCreateManyOrganizationInputEnvelopeSchema';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema } from './InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema';
import { InvitationUpdateManyWithWhereWithoutOrganizationInputSchema } from './InvitationUpdateManyWithWhereWithoutOrganizationInputSchema';
import { InvitationScalarWhereInputSchema } from './InvitationScalarWhereInputSchema';

export const InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema: z.ZodType<Prisma.InvitationUncheckedUpdateManyWithoutOrganizationNestedInput> = z.object({
  create: z.union([ z.lazy(() => InvitationCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateWithoutOrganizationInputSchema).array(),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema),z.lazy(() => InvitationUncheckedCreateWithoutOrganizationInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema),z.lazy(() => InvitationCreateOrConnectWithoutOrganizationInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpsertWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InvitationCreateManyOrganizationInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InvitationWhereUniqueInputSchema),z.lazy(() => InvitationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateWithWhereUniqueWithoutOrganizationInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema),z.lazy(() => InvitationUpdateManyWithWhereWithoutOrganizationInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InvitationScalarWhereInputSchema),z.lazy(() => InvitationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema;
