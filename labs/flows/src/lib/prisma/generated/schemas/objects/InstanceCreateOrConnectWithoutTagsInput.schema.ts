import { z } from 'zod';
import { InstanceWhereUniqueInputObjectSchema } from './InstanceWhereUniqueInput.schema';
import { InstanceCreateWithoutTagsInputObjectSchema } from './InstanceCreateWithoutTagsInput.schema';
import { InstanceUncheckedCreateWithoutTagsInputObjectSchema } from './InstanceUncheckedCreateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InstanceWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => InstanceCreateWithoutTagsInputObjectSchema),
      z.lazy(() => InstanceUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const InstanceCreateOrConnectWithoutTagsInputObjectSchema = Schema;
