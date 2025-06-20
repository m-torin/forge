import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';

export const EnumTaxonomyTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumTaxonomyTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => TaxonomyTypeSchema).optional()
}).strict();

export default EnumTaxonomyTypeFieldUpdateOperationsInputSchema;
