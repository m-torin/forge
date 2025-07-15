import { z } from 'zod';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceCreateWithoutTagGroupsInputObjectSchema } from './InstanceCreateWithoutTagGroupsInput.schema';
import { InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagGroupsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutTagGroupsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceCreateOrConnectWithoutTagGroupsInputObjectSchema = Schema;
