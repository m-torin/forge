import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleScalarWhereInputSchema } from './JrExtractionRuleScalarWhereInputSchema';

export const JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInputSchema: z.ZodType<Prisma.JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInput> = z.object({
  create: z.union([ z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema).array(),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => JrExtractionRuleScalarWhereInputSchema),z.lazy(() => JrExtractionRuleScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInputSchema;
