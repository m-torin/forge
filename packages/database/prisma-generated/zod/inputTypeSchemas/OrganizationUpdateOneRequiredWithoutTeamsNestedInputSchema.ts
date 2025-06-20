import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateWithoutTeamsInputSchema } from './OrganizationCreateWithoutTeamsInputSchema';
import { OrganizationUncheckedCreateWithoutTeamsInputSchema } from './OrganizationUncheckedCreateWithoutTeamsInputSchema';
import { OrganizationCreateOrConnectWithoutTeamsInputSchema } from './OrganizationCreateOrConnectWithoutTeamsInputSchema';
import { OrganizationUpsertWithoutTeamsInputSchema } from './OrganizationUpsertWithoutTeamsInputSchema';
import { OrganizationWhereUniqueInputSchema } from './OrganizationWhereUniqueInputSchema';
import { OrganizationUpdateToOneWithWhereWithoutTeamsInputSchema } from './OrganizationUpdateToOneWithWhereWithoutTeamsInputSchema';
import { OrganizationUpdateWithoutTeamsInputSchema } from './OrganizationUpdateWithoutTeamsInputSchema';
import { OrganizationUncheckedUpdateWithoutTeamsInputSchema } from './OrganizationUncheckedUpdateWithoutTeamsInputSchema';

export const OrganizationUpdateOneRequiredWithoutTeamsNestedInputSchema: z.ZodType<Prisma.OrganizationUpdateOneRequiredWithoutTeamsNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrganizationCreateWithoutTeamsInputSchema),z.lazy(() => OrganizationUncheckedCreateWithoutTeamsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrganizationCreateOrConnectWithoutTeamsInputSchema).optional(),
  upsert: z.lazy(() => OrganizationUpsertWithoutTeamsInputSchema).optional(),
  connect: z.lazy(() => OrganizationWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => OrganizationUpdateToOneWithWhereWithoutTeamsInputSchema),z.lazy(() => OrganizationUpdateWithoutTeamsInputSchema),z.lazy(() => OrganizationUncheckedUpdateWithoutTeamsInputSchema) ]).optional(),
}).strict();

export default OrganizationUpdateOneRequiredWithoutTeamsNestedInputSchema;
