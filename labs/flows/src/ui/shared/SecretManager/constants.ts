// constants.ts
import { SecretCategory } from '@prisma/client';

export const categoryOptions: { value: SecretCategory; label: string }[] = [
  { value: SecretCategory.node, label: 'Node' },
  { value: SecretCategory.flow, label: 'Flow' },
  { value: SecretCategory.global, label: 'Global' },
];
