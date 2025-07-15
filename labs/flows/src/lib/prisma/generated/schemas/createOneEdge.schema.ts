import { z } from 'zod';
import { EdgeSelectObjectSchema } from './objects/EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './objects/EdgeInclude.schema';
import { EdgeCreateInputObjectSchema } from './objects/EdgeCreateInput.schema';
import { EdgeUncheckedCreateInputObjectSchema } from './objects/EdgeUncheckedCreateInput.schema';

export const EdgeCreateOneSchema = z.object({
  select: EdgeSelectObjectSchema.optional(),
  include: EdgeIncludeObjectSchema.optional(),
  data: z.union([
    EdgeCreateInputObjectSchema,
    EdgeUncheckedCreateInputObjectSchema,
  ]),
});
