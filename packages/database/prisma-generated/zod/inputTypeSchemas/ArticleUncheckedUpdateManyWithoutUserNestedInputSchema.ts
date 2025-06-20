import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateWithoutUserInputSchema } from './ArticleCreateWithoutUserInputSchema';
import { ArticleUncheckedCreateWithoutUserInputSchema } from './ArticleUncheckedCreateWithoutUserInputSchema';
import { ArticleCreateOrConnectWithoutUserInputSchema } from './ArticleCreateOrConnectWithoutUserInputSchema';
import { ArticleUpsertWithWhereUniqueWithoutUserInputSchema } from './ArticleUpsertWithWhereUniqueWithoutUserInputSchema';
import { ArticleCreateManyUserInputEnvelopeSchema } from './ArticleCreateManyUserInputEnvelopeSchema';
import { ArticleWhereUniqueInputSchema } from './ArticleWhereUniqueInputSchema';
import { ArticleUpdateWithWhereUniqueWithoutUserInputSchema } from './ArticleUpdateWithWhereUniqueWithoutUserInputSchema';
import { ArticleUpdateManyWithWhereWithoutUserInputSchema } from './ArticleUpdateManyWithWhereWithoutUserInputSchema';
import { ArticleScalarWhereInputSchema } from './ArticleScalarWhereInputSchema';

export const ArticleUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ArticleUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => ArticleCreateWithoutUserInputSchema),z.lazy(() => ArticleCreateWithoutUserInputSchema).array(),z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema),z.lazy(() => ArticleUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ArticleCreateOrConnectWithoutUserInputSchema),z.lazy(() => ArticleCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ArticleUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ArticleUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ArticleCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ArticleWhereUniqueInputSchema),z.lazy(() => ArticleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ArticleWhereUniqueInputSchema),z.lazy(() => ArticleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ArticleWhereUniqueInputSchema),z.lazy(() => ArticleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ArticleWhereUniqueInputSchema),z.lazy(() => ArticleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ArticleUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => ArticleUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ArticleUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => ArticleUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ArticleScalarWhereInputSchema),z.lazy(() => ArticleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ArticleUncheckedUpdateManyWithoutUserNestedInputSchema;
