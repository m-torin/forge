import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './objects/InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './objects/InfrastructureInclude.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './objects/InfrastructureWhereUniqueInput.schema';
import { InfrastructureCreateInputObjectSchema } from './objects/InfrastructureCreateInput.schema';
import { InfrastructureUncheckedCreateInputObjectSchema } from './objects/InfrastructureUncheckedCreateInput.schema';
import { InfrastructureUpdateInputObjectSchema } from './objects/InfrastructureUpdateInput.schema';
import { InfrastructureUncheckedUpdateInputObjectSchema } from './objects/InfrastructureUncheckedUpdateInput.schema';

export const InfrastructureUpsertSchema = z.object({
  select: InfrastructureSelectObjectSchema.optional(),
  include: InfrastructureIncludeObjectSchema.optional(),
  where: InfrastructureWhereUniqueInputObjectSchema,
  create: z.union([
    InfrastructureCreateInputObjectSchema,
    InfrastructureUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    InfrastructureUpdateInputObjectSchema,
    InfrastructureUncheckedUpdateInputObjectSchema,
  ]),
});
