import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';

export const TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => TaxonomyWhereUniqueInputSchema),
          z.lazy(() => TaxonomyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => TaxonomyWhereUniqueInputSchema),
          z.lazy(() => TaxonomyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => TaxonomyWhereUniqueInputSchema),
          z.lazy(() => TaxonomyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => TaxonomyWhereUniqueInputSchema),
          z.lazy(() => TaxonomyWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => TaxonomyUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => TaxonomyScalarWhereInputSchema),
          z.lazy(() => TaxonomyScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
