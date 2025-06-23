import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { EnumJrRuleActionFieldUpdateOperationsInputSchema } from './EnumJrRuleActionFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';

export const JrFindReplaceRejectUpdateManyMutationInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyMutationInput> =
  z
    .object({
      lookFor: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      replaceWith: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      ruleAction: z
        .union([
          z.lazy(() => JrRuleActionSchema),
          z.lazy(() => EnumJrRuleActionFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      isRegex: z
        .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
        .optional(),
      regexFlags: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      priority: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectUpdateManyMutationInputSchema;
