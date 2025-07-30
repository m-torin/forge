'use client';

import React, { memo, useEffect, useState, useCallback, FC } from 'react';
import { Box, LoadingOverlay, Divider } from '@mantine/core';
import { useForm, UseFormReturnType } from '@mantine/form';
import { SecretCategory, type Secret } from '#/lib/prisma';
import { SecretForm, SecretFormValues } from './SecretForm';
import { SecretCategoryPanel } from './SecretCategoryPanel';
import {
  createSecretAction,
  getAllRelevantSecretsAction,
  deleteSecretAction,
  updateSecretAction,
} from '#/lib/prisma/serverActions';
import { showNotification } from '@mantine/notifications';
import { Prisma } from '@prisma/client';
import { logError } from '@repo/observability';

interface SecretManagerProps {
  flowId?: string;
  nodeId?: string;
}

export const SecretManager: FC<SecretManagerProps> = memo(
  ({ flowId, nodeId }) => {
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [editSecretId, setEditSecretId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form: UseFormReturnType<SecretFormValues> = useForm<SecretFormValues>(
      {
        initialValues: {
          secretName: '',
          secretValue: '',
          category: SecretCategory.global,
          shouldEncrypt: true,
        },
        validate: {
          secretName: (value: string) => (value ? null : 'Name is required'),
          secretValue: (value: string) =>
            value ? null : 'Secret value is required',
          category: (value: SecretCategory) =>
            value ? null : 'Category is required',
        },
      },
    );

    const openLoading = useCallback(() => setIsLoading(true), []);
    const closeLoading = useCallback(() => setIsLoading(false), []);

    const fetchSecrets = useCallback(async () => {
      openLoading();
      try {
        const fetchedSecrets = await getAllRelevantSecretsAction({
          ...(nodeId && { nodeId }),
          ...(flowId && { flowId }),
        });

        if (fetchedSecrets) {
          setSecrets(fetchedSecrets);
        } else {
          setSecrets([]);
          showNotification({
            title: 'Warning',
            message: 'No secrets found or error occurred.',
            color: 'yellow',
          });
        }
      } catch (error) {
        logError('Error fetching secrets', { error });
        showNotification({
          title: 'Error',
          message: 'Error fetching secrets.',
          color: 'red',
        });
        setSecrets([]);
      } finally {
        closeLoading();
      }
    }, [flowId, nodeId, openLoading, closeLoading]);

    useEffect(() => {
      fetchSecrets();
    }, [fetchSecrets]);

    const handleSubmit = useCallback(
      async (values: SecretFormValues) => {
        openLoading();
        try {
          const data: Prisma.SecretCreateInput = {
            name: values.secretName,
            secret: values.secretValue,
            shouldEncrypt: values.shouldEncrypt,
            category: values.category,
            ...(flowId && { flow: { connect: { id: flowId } } }),
            ...(nodeId && { node: { connect: { id: nodeId } } }),
          };

          const newSecret = await createSecretAction(data);

          if (newSecret) {
            showNotification({
              title: 'Success',
              message: 'Secret added successfully!',
              color: 'green',
            });
            form.reset();
            setSecrets((prev) => [...prev, newSecret]);
          } else {
            showNotification({
              title: 'Error',
              message: 'Error adding secret.',
              color: 'red',
            });
          }
        } catch (error) {
          logError('Error creating secret', { error });
          showNotification({
            title: 'Error',
            message: 'Error adding secret.',
            color: 'red',
          });
        } finally {
          closeLoading();
        }
      },
      [flowId, nodeId, form, openLoading, closeLoading],
    );

    const handleEditSubmit = useCallback(
      async (secretId: number, newValues: Prisma.SecretUpdateInput) => {
        openLoading();
        try {
          const updatedSecret = await updateSecretAction(secretId, newValues);

          if (updatedSecret) {
            setSecrets((prev) =>
              prev.map((s) => (s.id === secretId ? updatedSecret : s)),
            );
            showNotification({
              title: 'Success',
              message: 'Secret updated successfully!',
              color: 'green',
            });
            setEditSecretId(null);
          } else {
            showNotification({
              title: 'Error',
              message: 'Error updating secret.',
              color: 'red',
            });
          }
        } catch (error) {
          logError('Error updating secret', { error });
          showNotification({
            title: 'Error',
            message: 'Error updating secret.',
            color: 'red',
          });
        } finally {
          closeLoading();
        }
      },
      [openLoading, closeLoading],
    );

    const handleDelete = useCallback(
      async (secretId: number) => {
        openLoading();
        try {
          const deletedSecret = await deleteSecretAction(secretId);

          if (deletedSecret) {
            showNotification({
              title: 'Success',
              message: 'Secret deleted successfully!',
              color: 'green',
            });
            setSecrets((prev) => prev.filter((s) => s.id !== secretId));
          } else {
            showNotification({
              title: 'Error',
              message: 'Error deleting secret.',
              color: 'red',
            });
          }
        } catch (error) {
          logError('Error deleting secret', { error });
          showNotification({
            title: 'Error',
            message: 'Error deleting secret.',
            color: 'red',
          });
        } finally {
          closeLoading();
        }
      },
      [openLoading, closeLoading],
    );

    return (
      <Box style={{ position: 'relative' }}>
          <LoadingOverlay
            visible={isLoading}
            loaderProps={{ color: 'cyan' }}
            overlayProps={{ zIndex: 1000, radius: 'sm', blur: 2 }}
          />

          <SecretForm
            form={form}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <Divider my="lg" />

          <SecretCategoryPanel
            secrets={secrets}
            category={SecretCategory.global}
            isLoading={isLoading}
            handleEditSubmit={handleEditSubmit}
            setEditSecretId={setEditSecretId}
            handleDelete={handleDelete}
            editSecretId={editSecretId}
          />

          {nodeId && (
            <SecretCategoryPanel
              secrets={secrets}
              category={SecretCategory.node}
              isLoading={isLoading}
              handleEditSubmit={handleEditSubmit}
              setEditSecretId={setEditSecretId}
              handleDelete={handleDelete}
              editSecretId={editSecretId}
            />
          )}
          {flowId && (
            <SecretCategoryPanel
              secrets={secrets}
              category={SecretCategory.flow}
              isLoading={isLoading}
              handleEditSubmit={handleEditSubmit}
              setEditSecretId={setEditSecretId}
              handleDelete={handleDelete}
              editSecretId={editSecretId}
            />
          )}
        </Box>
    );
  },
);
