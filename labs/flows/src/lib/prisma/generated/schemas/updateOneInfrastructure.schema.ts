import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './objects/InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './objects/InfrastructureInclude.schema';
import { InfrastructureUpdateInputObjectSchema } from './objects/InfrastructureUpdateInput.schema';
import { InfrastructureUncheckedUpdateInputObjectSchema } from './objects/InfrastructureUncheckedUpdateInput.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './objects/InfrastructureWhereUniqueInput.schema';

export const InfrastructureUpdateOneSchema = z.object({
  select: InfrastructureSelectObjectSchema.optional(),
  include: InfrastructureIncludeObjectSchema.optional(),
  data: z.union([
    InfrastructureUpdateInputObjectSchema,
    InfrastructureUncheckedUpdateInputObjectSchema,
  ]),
  where: InfrastructureWhereUniqueInputObjectSchema,
});
