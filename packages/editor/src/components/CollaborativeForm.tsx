'use client';

import { Box, Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCallback } from 'react';
import { useCollaboration } from '../hooks/use-collaboration';
import { Collaborator } from '../types/index';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { PresenceIndicator } from './PresenceIndicator';

interface CollaborativeFormProps {
  documentId: string;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'email' | 'number';
    required?: boolean;
    placeholder?: string;
  }>;
  showCollaborators?: boolean;
}

export function CollaborativeForm({
  documentId,
  initialValues = {},
  onSubmit,
  fields,
  showCollaborators = true,
}: CollaborativeFormProps) {
  const form = useForm({
    initialValues,
  });

  const { collaborators, isConnected, sendEvent, updatePresence } = useCollaboration({
    documentId,
    userId: 'current-user', // This should come from auth context
    enablePresence: true,
  });

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      form.setFieldValue(fieldName, value);

      // Send real-time update
      sendEvent({
        type: 'edit',
        userId: 'current-user',
        data: {
          field: fieldName,
          value,
          formData: { ...form.values, [fieldName]: value },
        },
      });

      // Update presence to show current field being edited
      updatePresence({
        isActive: true,
        cursor: { x: 0, y: 0 }, // Could be updated with actual cursor position
      });
    },
    [form, sendEvent, updatePresence],
  );

  const handleSubmit = useCallback(
    (values: Record<string, any>) => {
      if (onSubmit) {
        onSubmit(values);
      }

      sendEvent({
        type: 'edit',
        userId: 'current-user',
        data: {
          action: 'submit',
          formData: values,
        },
      });

      notifications.show({
        title: 'Form Submitted',
        message: 'Your changes have been saved',
        color: 'green',
      });
    },
    [onSubmit, sendEvent],
  );

  const renderField = (field: (typeof fields)[0]) => {
    const commonProps = {
      key: field.name,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      value: form.values[field.name] || '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleFieldChange(field.name, event.target.value),
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} minRows={3} />;
      case 'email':
        return <TextInput {...commonProps} type="email" />;
      case 'number':
        return <TextInput {...commonProps} type="number" />;
      default:
        return <TextInput {...commonProps} />;
    }
  };

  return (
    <Box>
      {showCollaborators && (
        <Group justify="space-between" mb="md">
          <Group>
            {collaborators.map((collaborator: Collaborator) => (
              <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
            ))}
          </Group>
          <PresenceIndicator isConnected={isConnected} />
        </Group>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {fields.map(renderField)}

          <Group justify="flex-end" mt="md">
            <Button type="submit" disabled={!isConnected} loading={!isConnected}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
