'use client';

import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  Button,
  Group,
  Divider,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { dbSchema } from './schema';
import { DbUriValidator } from '#/ui/formFields';
import { useEffect } from 'react';
import { ConnectionString } from 'connection-string';
import { logDebug, logInfo } from '@repo/observability';

export const DatabaseForm = () => {
  const form = useForm({
    initialValues: {
      databaseType: '',
      databaseName: '',
      username: '',
      password: '',
      host: '',
      port: 3306,
      uri: '',
    },
    validate: zodResolver(dbSchema),
  });

  useEffect(() => {
    if (!form.values.uri) return;

    try {
      const cs = new ConnectionString(form.values.uri);

      // Only update if we have a valid connection string
      if (cs.protocol || cs.hostname) {
        form.setValues({
          databaseType: cs.protocol || '',
          databaseName: cs.path?.[0] || '',
          username: cs.user || '',
          password: cs.password || '',
          host: cs.hostname || '',
          port: cs.port || 3306,
          uri: form.values.uri, // Preserve the URI
        });
      }
    } catch (error) {
      // Invalid URI format, ignore
      logDebug('Invalid URI format provided for database connection', { 
        error, 
        uri: form.values.uri 
      });
    }
  }, [form.values.uri, form]);

  // Handle manual field updates
  useEffect(() => {
    const { uri: _uri, ...fields } = form.values;

    // Skip if we're updating from URI
    if (form.isTouched('uri')) return;

    // Only construct URI if we have required fields
    if (fields.databaseType && fields.host) {
      const uri = `${fields.databaseType}://${fields.username}:${fields.password}@${fields.host}:${fields.port}/${fields.databaseName}`;
      form.setFieldValue('uri', uri);
    }
  }, [
    form.values.databaseType,
    form.values.databaseName,
    form.values.username,
    form.values.password,
    form.values.host,
    form.values.port,
    form,
  ]);

  return (
    <Container>
      <Title mt="lg" order={2}>
        Database Connection Form
      </Title>

      <Paper shadow="xs" py="md">
        <form onSubmit={form.onSubmit((values: any) => {
          logInfo('Database connection form submitted', { connectionDetails: values });
        })}>
          <DbUriValidator form={form} />

          <Divider my="md" label="OR" />

          <Stack>
            <TextInput
              label="Database Type"
              placeholder="Enter database type (mysql, postgres, etc)"
              {...form.getInputProps('databaseType')}
            />
            <TextInput
              label="Database Name"
              placeholder="Enter database name"
              {...form.getInputProps('databaseName')}
            />
            <TextInput
              label="Username"
              placeholder="Enter username"
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Password"
              placeholder="Enter password"
              {...form.getInputProps('password')}
              type="password"
            />
            <TextInput
              label="Host"
              placeholder="Enter host"
              {...form.getInputProps('host')}
            />
            <NumberInput
              label="Port"
              placeholder="Enter port"
              {...form.getInputProps('port')}
            />
          </Stack>

          <Group mt="md">
            <Button type="submit">Save Connection Details</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};
