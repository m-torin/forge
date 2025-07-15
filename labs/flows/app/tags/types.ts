// types.ts
import type { Tag } from '#/lib/prisma';
import type { MantineColor } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

/** Interface representing a local tag group with associated tags */
export interface LocalTagGroup {
  id: string;
  name: string;
  color: MantineColor;
  tags: Tag[];
}

/** Props for the TagsPage component */
export interface TagsPageProps {
  params: {
    domain: string;
    cuid: string;
  };
}

/** Props for the TagGroupForm component */
export interface TagGroupFormProps {
  form: UseFormReturnType<{
    name: string;
    color: MantineColor;
  }>;
  onSubmit: () => void;
  isPending: boolean;
}

/** Props for the TagForm component */
export interface TagFormProps {
  form: UseFormReturnType<{
    name: string;
    tagGroupId: string;
  }>;
  onSubmit: () => void;
  tagGroups: LocalTagGroup[];
  isPending: boolean;
}
