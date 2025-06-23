import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutBrandInputSchema } from './MediaCreateWithoutBrandInputSchema';
import { MediaUncheckedCreateWithoutBrandInputSchema } from './MediaUncheckedCreateWithoutBrandInputSchema';
import { MediaCreateOrConnectWithoutBrandInputSchema } from './MediaCreateOrConnectWithoutBrandInputSchema';
import { MediaCreateManyBrandInputEnvelopeSchema } from './MediaCreateManyBrandInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaUncheckedCreateNestedManyWithoutBrandInputSchema: z.ZodType<Prisma.MediaUncheckedCreateNestedManyWithoutBrandInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutBrandInputSchema),
          z.lazy(() => MediaCreateWithoutBrandInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutBrandInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutBrandInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyBrandInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaUncheckedCreateNestedManyWithoutBrandInputSchema;
