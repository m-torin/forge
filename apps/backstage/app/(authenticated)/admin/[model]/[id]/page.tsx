import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRecord } from '../../actions';
import { getModelConfig } from '../../lib/model-config';
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Divider,
  Grid,
  Table,
  Code,
} from '@mantine/core';
import { IconEdit, IconArrowLeft } from '@tabler/icons-react';
import { format } from 'date-fns';

interface PageProps {
  params: { model: string; id: string };
}

export default async function ViewModelPage({ params }: PageProps) {
  const config = getModelConfig(params.model);
  if (!config) {
    notFound();
  }

  const record = await getRecord(params.model, params.id, config.includes);
  if (!record) {
    notFound();
  }

  // Helper to format field values for display
  const formatValue = (value: any, fieldType?: string): React.ReactNode => {
    if (value === null || value === undefined) return <Text c="dimmed">N/A</Text>;

    if (fieldType === 'json' || typeof value === 'object') {
      return <Code block>{JSON.stringify(value, null, 2)}</Code>;
    }

    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      try {
        return format(new Date(value), 'PPp');
      } catch {
        return value.toString();
      }
    }

    if (typeof value === 'boolean') {
      return (
        <Badge color={value ? 'green' : 'gray'} variant="light">
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    return value.toString();
  };

  // Get the display name for the record
  const displayName = record.name || record.title || record.email || `${config.name} #${record.id}`;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Group gap="sm" mb="xs">
            <Button
              component={Link}
              href={`/admin/${params.model}`}
              variant="subtle"
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
            >
              Back to {config.pluralName}
            </Button>
          </Group>
          <Title order={1}>{displayName}</Title>
          <Text c="dimmed" mt="xs">
            {config.name} Details
          </Text>
        </div>
        <Button
          component={Link}
          href={`/admin/${params.model}/${record.id}/edit`}
          leftSection={<IconEdit size={16} />}
        >
          Edit {config.name}
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Details</Title>
              <Divider />

              <Grid>
                {config.fields.map((field) => (
                  <Grid.Col key={field.name} span={{ base: 12, sm: 6 }}>
                    <Text size="sm" c="dimmed">
                      {field.label}
                    </Text>
                    <div>{formatValue(record[field.name], field.type)}</div>
                  </Grid.Col>
                ))}
              </Grid>

              {/* Show additional fields not in config */}
              {Object.entries(record).filter(
                ([key]) =>
                  !config.fields.some((f) => f.name === key) &&
                  !['id', 'createdAt', 'updatedAt', '_count'].includes(key) &&
                  !key.endsWith('Id'),
              ).length > 0 && (
                <>
                  <Divider />
                  <Title order={4}>Additional Fields</Title>
                  <Grid>
                    {Object.entries(record)
                      .filter(
                        ([key]) =>
                          !config.fields.some((f) => f.name === key) &&
                          !['id', 'createdAt', 'updatedAt', '_count'].includes(key) &&
                          !key.endsWith('Id'),
                      )
                      .map(([key, value]) => (
                        <Grid.Col key={key} span={{ base: 12, sm: 6 }}>
                          <Text size="sm" c="dimmed">
                            {key}
                          </Text>
                          <div>{formatValue(value)}</div>
                        </Grid.Col>
                      ))}
                  </Grid>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card withBorder>
              <Stack gap="sm">
                <Title order={4}>Metadata</Title>
                <div>
                  <Text size="sm" c="dimmed">
                    ID
                  </Text>
                  <Code>{record.id}</Code>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Created At
                  </Text>
                  <Text size="sm">{formatValue(record.createdAt)}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">
                    Updated At
                  </Text>
                  <Text size="sm">{formatValue(record.updatedAt)}</Text>
                </div>
              </Stack>
            </Card>

            {/* Show counts if available */}
            {record._count && Object.keys(record._count).length > 0 && (
              <Card withBorder>
                <Stack gap="sm">
                  <Title order={4}>Related Records</Title>
                  {Object.entries(record._count).map(([key, count]) => (
                    <Group key={key} justify="space-between">
                      <Text size="sm" c="dimmed" tt="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <Badge>{count as number}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Card>
            )}

            {/* Show related records */}
            {Object.entries(record).filter(
              ([key, value]) =>
                typeof value === 'object' &&
                value !== null &&
                !['_count'].includes(key) &&
                !key.endsWith('At'),
            ).length > 0 && (
              <Card withBorder>
                <Stack gap="sm">
                  <Title order={4}>Relations</Title>
                  {Object.entries(record)
                    .filter(
                      ([key, value]) =>
                        typeof value === 'object' &&
                        value !== null &&
                        !['_count'].includes(key) &&
                        !key.endsWith('At'),
                    )
                    .map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <Text size="sm" c="dimmed" tt="capitalize" mb={4}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        {Array.isArray(value) ? (
                          <Text size="sm">{value.length} records</Text>
                        ) : (
                          <Text size="sm">
                            {value.name || value.title || value.email || `ID: ${value.id}`}
                          </Text>
                        )}
                      </div>
                    ))}
                </Stack>
              </Card>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
