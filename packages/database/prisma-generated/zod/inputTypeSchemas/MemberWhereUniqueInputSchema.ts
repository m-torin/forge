import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberUserIdOrganizationIdCompoundUniqueInputSchema } from './MemberUserIdOrganizationIdCompoundUniqueInputSchema';
import { MemberWhereInputSchema } from './MemberWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { OrganizationScalarRelationFilterSchema } from './OrganizationScalarRelationFilterSchema';
import { OrganizationWhereInputSchema } from './OrganizationWhereInputSchema';

export const MemberWhereUniqueInputSchema: z.ZodType<Prisma.MemberWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      userId_organizationId: z.lazy(() => MemberUserIdOrganizationIdCompoundUniqueInputSchema),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      userId_organizationId: z.lazy(() => MemberUserIdOrganizationIdCompoundUniqueInputSchema),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().optional(),
        userId_organizationId: z
          .lazy(() => MemberUserIdOrganizationIdCompoundUniqueInputSchema)
          .optional(),
        AND: z
          .union([
            z.lazy(() => MemberWhereInputSchema),
            z.lazy(() => MemberWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => MemberWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => MemberWhereInputSchema),
            z.lazy(() => MemberWhereInputSchema).array(),
          ])
          .optional(),
        userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        organizationId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        role: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        user: z
          .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
          .optional(),
        organization: z
          .union([
            z.lazy(() => OrganizationScalarRelationFilterSchema),
            z.lazy(() => OrganizationWhereInputSchema),
          ])
          .optional(),
      })
      .strict(),
  );

export default MemberWhereUniqueInputSchema;
