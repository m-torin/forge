import { Paper, Group, Text, Badge, ThemeIcon, NumberFormatter, Alert } from '@mantine/core';
import { IconBolt, IconAlertTriangle } from '@tabler/icons-react';
import { unstable_noStore as noStore } from 'next/cache';

interface SearchStatsServerProps {
  initialData?: any;
  'data-testid'?: string;
}

function SearchStatsError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" data-testid={testId}>
      <Text size="sm">Search stats failed to load: {error}</Text>
    </Alert>
  );
}

export async function SearchStatsServer({
  initialData,
  'data-testid': testId = 'search-stats-server',
}: SearchStatsServerProps) {
  // Opt out of static rendering
  noStore();

  const nbHits = initialData?.nbHits || 0;
  const processingTimeMS = initialData?.processingTimeMS || 0;
  const query = initialData?.query || '';

  const isGoodPerformance = processingTimeMS < 100;
  const hasResults = nbHits > 0;
  const isLargeResultSet = nbHits > 1000;

  if (!query && nbHits === 0) {
    return null;
  }

  try {
    return (
      <Paper
        p="md"
        radius="sm"
        bg="gray.0"
        style={{ borderLeft: '4px solid var(--mantine-color-blue-6)' }}
      >
        <Group justify="space-between" ta="center">
          <Group gap="lg">
            <Group gap="xs">
              <ThemeIcon size="md" variant="light" color={hasResults ? 'green' : 'orange'}>
                <IconBolt size={12} />
              </ThemeIcon>
              <Text size="md" fw={500}>
                <NumberFormatter value={nbHits} thousandSeparator /> products found
              </Text>
            </Group>

            <Group gap="xs">
              <ThemeIcon size="md" variant="light" color={isGoodPerformance ? 'green' : 'yellow'}>
                <IconBolt size={12} />
              </ThemeIcon>
              <Text size="md" c="dimmed">
                in {processingTimeMS}ms
              </Text>
            </Group>

            {isLargeResultSet && (
              <Badge size="md" variant="light" c="blue">
                Large catalog
              </Badge>
            )}
          </Group>

          {query && (
            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
              for "{query}"
            </Text>
          )}
        </Group>
      </Paper>
    );
  } catch (err) {
    console.error('SearchStatsServer error:', err);
    return (
      <SearchStatsError
        error={err instanceof Error ? err.message : 'Failed to render search statistics'}
        testId={testId}
      />
    );
  }
}
