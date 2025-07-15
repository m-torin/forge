import { z } from 'zod';
import { EdgeSelectObjectSchema } from './objects/EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './objects/EdgeInclude.schema';
import { EdgeWhereUniqueInputObjectSchema } from './objects/EdgeWhereUniqueInput.schema';

export const EdgeFindUniqueSchema = z.object({
  select: EdgeSelectObjectSchema.optional(),
  include: EdgeIncludeObjectSchema.optional(),
  where: EdgeWhereUniqueInputObjectSchema,
});
