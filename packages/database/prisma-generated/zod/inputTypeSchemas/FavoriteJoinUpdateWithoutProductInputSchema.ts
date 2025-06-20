import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutFavoritesNestedInputSchema } from './UserUpdateOneRequiredWithoutFavoritesNestedInputSchema';
import { CollectionUpdateOneWithoutFavoritesNestedInputSchema } from './CollectionUpdateOneWithoutFavoritesNestedInputSchema';

export const FavoriteJoinUpdateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithoutProductInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
  collection: z.lazy(() => CollectionUpdateOneWithoutFavoritesNestedInputSchema).optional()
}).strict();

export default FavoriteJoinUpdateWithoutProductInputSchema;
