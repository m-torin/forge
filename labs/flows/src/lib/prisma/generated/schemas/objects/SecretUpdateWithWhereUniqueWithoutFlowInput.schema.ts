import { z } from 'zod';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretUpdateWithoutFlowInputObjectSchema } from './SecretUpdateWithoutFlowInput.schema';
import { SecretUncheckedUpdateWithoutFlowInputObjectSchema } from './SecretUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => SecretUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => SecretUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const SecretUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
