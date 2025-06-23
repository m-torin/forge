import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutDeletedByInputSchema } from './ArticleCreateWithoutDeletedByInputSchema';
import { ArticleUncheckedCreateWithoutDeletedByInputSchema } from './ArticleUncheckedCreateWithoutDeletedByInputSchema';
import { ArticleCreateOrConnectWithoutDeletedByInputSchema } from './ArticleCreateOrConnectWithoutDeletedByInputSchema';
import { ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { ArticleCreateManyDeletedByInputEnvelopeSchema } from './ArticleCreateManyDeletedByInputEnvelopeSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { ArticleUpdateManyWithWhereWithoutDeletedByInputSchema } from './ArticleUpdateManyWithWhereWithoutDeletedByInputSchema';
import { ArticleScalarWhereInputSchema } from './ArticleScalarWhereInputSchema';

export const ArticleUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.ArticleUpdateManyWithoutDeletedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ArticleCreateWithoutDeletedByInputSchema),
          z.lazy(() => ArticleCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => ArticleUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => ArticleUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ArticleCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => ArticleCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ArticleUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ArticleCreateManyDeletedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => ArticleWhereUniqueInputSchema),
          z.lazy(() => ArticleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ArticleWhereUniqueInputSchema),
          z.lazy(() => ArticleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ArticleWhereUniqueInputSchema),
          z.lazy(() => ArticleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ArticleWhereUniqueInputSchema),
          z.lazy(() => ArticleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ArticleUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ArticleUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => ArticleUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ArticleScalarWhereInputSchema),
          z.lazy(() => ArticleScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ArticleUpdateManyWithoutDeletedByNestedInputSchema;
