import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { EnumJrRuleActionFieldUpdateOperationsInputSchema } from './EnumJrRuleActionFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { LocationUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './LocationUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { TaxonomyUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './TaxonomyUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { StoryUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './StoryUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { FandomUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './FandomUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { CastUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema } from './CastUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema';
import { JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInputSchema } from './JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInputSchema';

export const JrFindReplaceRejectUpdateWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithoutBrandsInput> = z.object({
  lookFor: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  replaceWith: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  ruleAction: z.union([ z.lazy(() => JrRuleActionSchema),z.lazy(() => EnumJrRuleActionFieldUpdateOperationsInputSchema) ]).optional(),
  isRegex: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  regexFlags: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  locations: z.lazy(() => LocationUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  stories: z.lazy(() => StoryUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  fandoms: z.lazy(() => FandomUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  series: z.lazy(() => SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  casts: z.lazy(() => CastUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleUpdateManyWithoutFindReplaceRulesNestedInputSchema).optional()
}).strict();

export default JrFindReplaceRejectUpdateWithoutBrandsInputSchema;
