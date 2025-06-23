import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyCreateWithoutUserInputSchema } from './PasskeyCreateWithoutUserInputSchema';
import { PasskeyUncheckedCreateWithoutUserInputSchema } from './PasskeyUncheckedCreateWithoutUserInputSchema';
import { PasskeyCreateOrConnectWithoutUserInputSchema } from './PasskeyCreateOrConnectWithoutUserInputSchema';
import { PasskeyCreateManyUserInputEnvelopeSchema } from './PasskeyCreateManyUserInputEnvelopeSchema';
import { PasskeyWhereUniqueInputSchema } from './PasskeyWhereUniqueInputSchema';

export const PasskeyCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.PasskeyCreateNestedManyWithoutUserInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PasskeyCreateWithoutUserInputSchema),
          z.lazy(() => PasskeyCreateWithoutUserInputSchema).array(),
          z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => PasskeyCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PasskeyCreateManyUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => PasskeyWhereUniqueInputSchema),
          z.lazy(() => PasskeyWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PasskeyCreateNestedManyWithoutUserInputSchema;
