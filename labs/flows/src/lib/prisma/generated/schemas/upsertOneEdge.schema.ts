import { z } from 'zod';
import { EdgeSelectObjectSchema } from './objects/EdgeSelect.schema';
import { EdgeIncludeObjectSchema } from './objects/EdgeInclude.schema';
import { EdgeWhereUniqueInputObjectSchema } from './objects/EdgeWhereUniqueInput.schema';
import { EdgeCreateInputObjectSchema } from './objects/EdgeCreateInput.schema';
import { EdgeUncheckedCreateInputObjectSchema } from './objects/EdgeUncheckedCreateInput.schema';
import { EdgeUpdateInputObjectSchema } from './objects/EdgeUpdateInput.schema';
import { EdgeUncheckedUpdateInputObjectSchema } from './objects/EdgeUncheckedUpdateInput.schema';

export const EdgeUpsertSchema = z.object({
  select: EdgeSelectObjectSchema.optional(),
  include: EdgeIncludeObjectSchema.optional(),
  where: EdgeWhereUniqueInputObjectSchema,
  create: z.union([
    EdgeCreateInputObjectSchema,
    EdgeUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    EdgeUpdateInputObjectSchema,
    EdgeUncheckedUpdateInputObjectSchema,
  ]),
});
