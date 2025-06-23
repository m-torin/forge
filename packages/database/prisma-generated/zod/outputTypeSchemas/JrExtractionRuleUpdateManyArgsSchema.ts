import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleUpdateManyMutationInputSchema } from '../inputTypeSchemas/JrExtractionRuleUpdateManyMutationInputSchema';
import { JrExtractionRuleUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/JrExtractionRuleUncheckedUpdateManyInputSchema';
import { JrExtractionRuleWhereInputSchema } from '../inputTypeSchemas/JrExtractionRuleWhereInputSchema';

export const JrExtractionRuleUpdateManyArgsSchema: z.ZodType<Prisma.JrExtractionRuleUpdateManyArgs> =
  z
    .object({
      data: z.union([
        JrExtractionRuleUpdateManyMutationInputSchema,
        JrExtractionRuleUncheckedUpdateManyInputSchema,
      ]),
      where: JrExtractionRuleWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default JrExtractionRuleUpdateManyArgsSchema;
