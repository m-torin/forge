import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogUpdateManyMutationInputSchema } from '../inputTypeSchemas/AuditLogUpdateManyMutationInputSchema'
import { AuditLogUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/AuditLogUncheckedUpdateManyInputSchema'
import { AuditLogWhereInputSchema } from '../inputTypeSchemas/AuditLogWhereInputSchema'

export const AuditLogUpdateManyArgsSchema: z.ZodType<Prisma.AuditLogUpdateManyArgs> = z.object({
  data: z.union([ AuditLogUpdateManyMutationInputSchema,AuditLogUncheckedUpdateManyInputSchema ]),
  where: AuditLogWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default AuditLogUpdateManyArgsSchema;
