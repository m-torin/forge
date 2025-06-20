import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { EnumJrRuleActionFieldUpdateOperationsInputSchema } from './EnumJrRuleActionFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { CastUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './CastUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesNestedInputSchema } from './JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesNestedInputSchema';

export const JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedUpdateWithoutBrandsInput> = z.object({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lookFor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  replaceWith: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ruleAction: z.union([ z.lazy(() => JrRuleActionSchema),z.lazy(() => EnumJrRuleActionFieldUpdateOperationsInputSchema) ]).optional(),
  isRegex: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  regexFlags: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  stories: z.lazy(() => StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  fandoms: z.lazy(() => FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  series: z.lazy(() => SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  casts: z.lazy(() => CastUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesNestedInputSchema).optional()
}).strict();

export default JrFindReplaceRejectUncheckedUpdateWithoutBrandsInputSchema;
