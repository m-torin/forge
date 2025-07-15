import { z } from 'zod';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretCreateWithoutFlowInputObjectSchema } from './SecretCreateWithoutFlowInput.schema';
import { SecretUncheckedCreateWithoutFlowInputObjectSchema } from './SecretUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => SecretCreateWithoutFlowInputObjectSchema),
      z.lazy(() => SecretUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const SecretCreateOrConnectWithoutFlowInputObjectSchema = Schema;
