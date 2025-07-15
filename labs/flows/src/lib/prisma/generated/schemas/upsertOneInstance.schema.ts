import { z } from 'zod';
import { InstanceSelectObjectSchema } from './objects/InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './objects/InstanceInclude.schema';
import { InstanceWhereUniqueInputObjectSchema } from './objects/InstanceWhereUniqueInput.schema';
import { InstanceCreateInputObjectSchema } from './objects/InstanceCreateInput.schema';
import { InstanceUncheckedCreateInputObjectSchema } from './objects/InstanceUncheckedCreateInput.schema';
import { InstanceUpdateInputObjectSchema } from './objects/InstanceUpdateInput.schema';
import { InstanceUncheckedUpdateInputObjectSchema } from './objects/InstanceUncheckedUpdateInput.schema';

export const InstanceUpsertSchema = z.object({
  select: InstanceSelectObjectSchema.optional(),
  include: InstanceIncludeObjectSchema.optional(),
  where: InstanceWhereUniqueInputObjectSchema,
  create: z.union([
    InstanceCreateInputObjectSchema,
    InstanceUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    InstanceUpdateInputObjectSchema,
    InstanceUncheckedUpdateInputObjectSchema,
  ]),
});
