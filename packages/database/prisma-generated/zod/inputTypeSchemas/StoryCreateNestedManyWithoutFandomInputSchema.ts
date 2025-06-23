import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutFandomInputSchema } from './StoryCreateWithoutFandomInputSchema';
import { StoryUncheckedCreateWithoutFandomInputSchema } from './StoryUncheckedCreateWithoutFandomInputSchema';
import { StoryCreateOrConnectWithoutFandomInputSchema } from './StoryCreateOrConnectWithoutFandomInputSchema';
import { StoryCreateManyFandomInputEnvelopeSchema } from './StoryCreateManyFandomInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';

export const StoryCreateNestedManyWithoutFandomInputSchema: z.ZodType<Prisma.StoryCreateNestedManyWithoutFandomInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => StoryCreateWithoutFandomInputSchema),
          z.lazy(() => StoryCreateWithoutFandomInputSchema).array(),
          z.lazy(() => StoryUncheckedCreateWithoutFandomInputSchema),
          z.lazy(() => StoryUncheckedCreateWithoutFandomInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => StoryCreateOrConnectWithoutFandomInputSchema),
          z.lazy(() => StoryCreateOrConnectWithoutFandomInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => StoryCreateManyFandomInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default StoryCreateNestedManyWithoutFandomInputSchema;
