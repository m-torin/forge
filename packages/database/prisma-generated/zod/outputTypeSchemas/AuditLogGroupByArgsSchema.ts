import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogWhereInputSchema } from '../inputTypeSchemas/AuditLogWhereInputSchema'
import { AuditLogOrderByWithAggregationInputSchema } from '../inputTypeSchemas/AuditLogOrderByWithAggregationInputSchema'
import { AuditLogScalarFieldEnumSchema } from '../inputTypeSchemas/AuditLogScalarFieldEnumSchema'
import { AuditLogScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/AuditLogScalarWhereWithAggregatesInputSchema'

export const AuditLogGroupByArgsSchema: z.ZodType<Prisma.AuditLogGroupByArgs> = z.object({
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithAggregationInputSchema.array(),AuditLogOrderByWithAggregationInputSchema ]).optional(),
  by: AuditLogScalarFieldEnumSchema.array(),
  having: AuditLogScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default AuditLogGroupByArgsSchema;
