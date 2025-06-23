import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      email: z.lazy(() => SortOrderSchema).optional(),
      emailVerified: z.lazy(() => SortOrderSchema).optional(),
      image: z.lazy(() => SortOrderSchema).optional(),
      phoneNumber: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      role: z.lazy(() => SortOrderSchema).optional(),
      banned: z.lazy(() => SortOrderSchema).optional(),
      banReason: z.lazy(() => SortOrderSchema).optional(),
      banExpires: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z.lazy(() => SortOrderSchema).optional(),
      bio: z.lazy(() => SortOrderSchema).optional(),
      expertise: z.lazy(() => SortOrderSchema).optional(),
      isVerifiedAuthor: z.lazy(() => SortOrderSchema).optional(),
      authorSince: z.lazy(() => SortOrderSchema).optional(),
      preferences: z.lazy(() => SortOrderSchema).optional(),
      isSuspended: z.lazy(() => SortOrderSchema).optional(),
      suspensionDetails: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default UserCountOrderByAggregateInputSchema;
