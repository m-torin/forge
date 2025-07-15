'use client';

import React, { useState, useMemo, useTransition, useCallback } from 'react';
import {
  Badge,
  Container,
  Divider,
  rem,
  Group,
  Text,
  Loader,
  Alert,
} from '@mantine/core';
import { createTagAction, createTagGroupAction } from '#/lib/prisma';
import { TagGroupForm } from './TagGroupForm';
import { TagForm } from './TagForm';
import { useForm } from '@mantine/form';
import type { MantineColor } from '@mantine/core';
import type { LocalTagGroup } from './types';
import { buildTagGroups, refreshTags } from './logic';

interface TagsUIProps {
  initialTagGroups: LocalTagGroup[];
  instanceId: string;
}

export const TagsUI: React.FC<TagsUIProps> = ({
  initialTagGroups,
  instanceId,
}) => {
  const [tagGroups, setTagGroups] = useState<LocalTagGroup[]>(initialTagGroups);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const tagForm = useForm({
    initialValues: {
      name: '',
      tagGroupId: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
    },
  });

  const tagGroupForm = useForm({
    initialValues: {
      name: '',
      color: 'gray' as MantineColor,
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      color: (value) => (value ? null : 'Color is required'),
    },
  });

  const handleTagFormSubmit = useCallback(
    async (values: { name: string; tagGroupId: string }): Promise<void> => {
      // Instance ID check removed - using default

      try {
        setLoading(true);
        await createTagAction(
          { name: values.name, tagGroupId: values.tagGroupId },
          instanceId, // Use proper instance ID
        );
        await refreshTags(setTagGroups, setError, buildTagGroups, instanceId);
        startTransition(() => {
          tagForm.reset();
        });
      } catch (_err) {
        setError('Failed to create tag or fetch updated tags.');
      } finally {
        setLoading(false);
      }
    },
    [tagForm, instanceId],
  );

  const handleTagGroupFormSubmit = useCallback(
    async (values: { name: string; color: MantineColor }): Promise<void> => {
      // Instance ID check removed - using default

      try {
        setLoading(true);
        await createTagGroupAction(
          { name: values.name, color: values.color },
          instanceId, // Use proper instance ID
        );
        await refreshTags(setTagGroups, setError, buildTagGroups, instanceId);
        startTransition(() => {
          tagGroupForm.reset();
        });
      } catch (_err) {
        setError('Failed to create tag group or fetch updated groups.');
      } finally {
        setLoading(false);
      }
    },
    [tagGroupForm, instanceId],
  );

  const memoizedTagGroups = useMemo(() => tagGroups, [tagGroups]);

  return (
    <Container>
      {error && (
        <Alert
          title="Error"
          color="red"
          mb="md"
          onClose={() => setError(null)}
          withCloseButton
        >
          {error}
        </Alert>
      )}

      <TagGroupForm
        form={tagGroupForm}
        onSubmit={tagGroupForm.onSubmit(handleTagGroupFormSubmit)}
        isPending={isPending}
      />
      <Divider my={rem(30)} />

      <TagForm
        form={tagForm}
        onSubmit={tagForm.onSubmit(handleTagFormSubmit)}
        tagGroups={memoizedTagGroups}
        isPending={isPending}
      />
      <Divider my={rem(30)} />

      <Text component="h2" size="xl" fw={500} mb="md">
        Tag Groups:
      </Text>

      {loading ? (
        <Loader variant="dots" />
      ) : memoizedTagGroups.length > 0 ? (
        memoizedTagGroups.map((group) => (
          <div key={group.id} style={{ marginBottom: '1rem' }}>
            <Text size="lg" fw={500}>
              {group.name}
            </Text>
            <Group gap="xs" mt="xs">
              {group.tags.map((tag) => (
                <Badge key={tag.id} color={group.color} variant="light">
                  {tag.name}
                </Badge>
              ))}
            </Group>
          </div>
        ))
      ) : (
        <Text>No Tag Groups available.</Text>
      )}
    </Container>
  );
};

export default TagsUI;
