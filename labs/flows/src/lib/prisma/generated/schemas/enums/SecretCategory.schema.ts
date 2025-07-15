import { z } from 'zod';

export const SecretCategorySchema = z.enum(['flow', 'global', 'node']);
