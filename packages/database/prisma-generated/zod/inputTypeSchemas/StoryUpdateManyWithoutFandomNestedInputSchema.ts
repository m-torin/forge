import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutFandomInputSchema } from './StoryCreateWithoutFandomInputSchema';
import { StoryUncheckedCreateWithoutFandomInputSchema } from './StoryUncheckedCreateWithoutFandomInputSchema';
import { StoryCreateOrConnectWithoutFandomInputSchema } from './StoryCreateOrConnectWithoutFandomInputSchema';
import { StoryUpsertWithWhereUniqueWithoutFandomInputSchema } from './StoryUpsertWithWhereUniqueWithoutFandomInputSchema';
import { StoryCreateManyFandomInputEnvelopeSchema } from './StoryCreateManyFandomInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithWhereUniqueWithoutFandomInputSchema } from './StoryUpdateWithWhereUniqueWithoutFandomInputSchema';
import { StoryUpdateManyWithWhereWithoutFandomInputSchema } from './StoryUpdateManyWithWhereWithoutFandomInputSchema';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';

export const StoryUpdateManyWithoutFandomNestedInputSchema: z.ZodType<Prisma.StoryUpdateManyWithoutFandomNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutFandomInputSchema),
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutFandomInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => StoryCreateManyFandomInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutFandomInputSchema),
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutFandomInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => StoryUpdateManyWithWhereWithoutFandomInputSchema),
          z.lazy(() => StoryUpdateManyWithWhereWithoutFandomInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => StoryScalarWhereInputSchema),
          z.lazy(() => StoryScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default StoryUpdateManyWithoutFandomNestedInputSchema;
