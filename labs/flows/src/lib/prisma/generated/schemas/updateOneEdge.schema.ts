import { z } from 'zod';
import { EdgeSelectObjectSchema } from './objects/EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './objects/EdgeInclude.schema';
import { EdgeUpdateInputObjectSchema } from './objects/EdgeUpdateInput.schema';
import { EdgeUncheckedUpdateInputObjectSchema } from './objects/EdgeUncheckedUpdateInput.schema';
import { EdgeWhereUniqueInputObjectSchema } from './objects/EdgeWhereUniqueInput.schema';

export const EdgeUpdateOneSchema = z.object({
  select: EdgeSelectObjectSchema.optional(),
  include: EdgeIncludeObjectSchema.optional(),
  data: z.union([
    EdgeUpdateInputObjectSchema,
    EdgeUncheckedUpdateInputObjectSchema,
  ]),
  where: EdgeWhereUniqueInputObjectSchema,
});
