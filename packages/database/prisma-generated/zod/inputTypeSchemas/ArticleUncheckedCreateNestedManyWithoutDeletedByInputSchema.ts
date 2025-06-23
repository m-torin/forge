import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutDeletedByInputSchema } from './ArticleCreateWithoutDeletedByInputSchema';
import { ArticleUncheckedCreateWithoutDeletedByInputSchema } from './ArticleUncheckedCreateWithoutDeletedByInputSchema';
import { ArticleCreateOrConnectWithoutDeletedByInputSchema } from './ArticleCreateOrConnectWithoutDeletedByInputSchema';
import { ArticleCreateManyDeletedByInputEnvelopeSchema } from './ArticleCreateManyDeletedByInputEnvelopeSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';

export const ArticleUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.ArticleUncheckedCreateNestedManyWithoutDeletedByInput> =
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
      createMany: z.lazy(() => ArticleCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ArticleWhereUniqueInputSchema),
          z.lazy(() => ArticleWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ArticleUncheckedCreateNestedManyWithoutDeletedByInputSchema;
