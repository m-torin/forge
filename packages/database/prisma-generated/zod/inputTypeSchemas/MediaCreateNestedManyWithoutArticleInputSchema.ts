import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutArticleInputSchema } from './MediaCreateWithoutArticleInputSchema';
import { MediaUncheckedCreateWithoutArticleInputSchema } from './MediaUncheckedCreateWithoutArticleInputSchema';
import { MediaCreateOrConnectWithoutArticleInputSchema } from './MediaCreateOrConnectWithoutArticleInputSchema';
import { MediaCreateManyArticleInputEnvelopeSchema } from './MediaCreateManyArticleInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaCreateNestedManyWithoutArticleInputSchema: z.ZodType<Prisma.MediaCreateNestedManyWithoutArticleInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutArticleInputSchema),
          z.lazy(() => MediaCreateWithoutArticleInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutArticleInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutArticleInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyArticleInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaCreateNestedManyWithoutArticleInputSchema;
