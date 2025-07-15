import { z } from 'zod';
import { InstanceSelectObjectSchema } from './objects/InstanceSelect.schema';
import { InstanceIncludeObjectSchema } from './objects/InstanceInclude.schema';
import { InstanceCreateInputObjectSchema } from './objects/InstanceCreateInput.schema';
import { InstanceUncheckedCreateInputObjectSchema } from './objects/InstanceUncheckedCreateInput.schema';

export const InstanceCreateOneSchema = z.object({
  select: InstanceSelectObjectSchema.optional(),
  include: InstanceIncludeObjectSchema.optional(),
  data: z.union([
    InstanceCreateInputObjectSchema,
    InstanceUncheckedCreateInputObjectSchema,
  ]),
});
