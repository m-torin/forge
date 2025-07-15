import { z } from 'zod';
import { InstanceSelectObjectSchema } from './objects/InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './objects/InstanceInclude.schema';
import { InstanceUpdateInputObjectSchema } from './objects/InstanceUpdateInput.schema';
import { InstanceUncheckedUpdateInputObjectSchema } from './objects/InstanceUncheckedUpdateInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './objects/InstanceWhereUniqueInput.schema';

export const InstanceUpdateOneSchema = z.object({
  select: InstanceSelectObjectSchema.optional(),
  include: InstanceIncludeObjectSchema.optional(),
  data: z.union([
    InstanceUpdateInputObjectSchema,
    InstanceUncheckedUpdateInputObjectSchema,
  ]),
  where: InstanceWhereUniqueInputObjectSchema,
});
