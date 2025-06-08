'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Group,
  Image,
  Progress,
  rem,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconClock,
  IconRefresh,
  IconRobot,
  IconThumbDown,
  IconThumbUp,
  IconVector,
} from '@tabler/icons-react';

export interface ProductClassification {
  classification: {
    categoryId: string;
    categoryPath: string[];
    confidence: number;
    reasoning: string;
    method: 'hybrid' | 'ai-only' | 'vector-only';
  };
  feedback?: string;
  id: string;
  product: {
    title: string;
    description: string;
    brand?: string;
    price?: number;
    image?: string;
  };
  productId: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

interface ClassificationCardProps {
  classification: ProductClassification;
  isRerunning?: boolean;
  onApprove: (classification: ProductClassification) => void;
  onReject: (classification: ProductClassification) => void;
  onRerun: (classification: ProductClassification) => void;
}

export function ClassificationCard({
  classification,
  isRerunning,
  onApprove,
  onReject,
  onRerun,
}: ClassificationCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'green';
    if (confidence >= 0.7) return 'yellow';
    return 'red';
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'hybrid':
        return <IconRobot size={16} />;
      case 'ai-only':
        return <IconRobot size={16} />;
      case 'vector-only':
        return <IconVector size={16} />;
      default:
        return null;
    }
  };

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <Card shadow="sm" withBorder p="lg" radius="md">
      <Card.Section withBorder inheritPadding mb="md" py="sm">
        <Group justify="space-between">
          <Group>
            <Title order={4}>{classification.product.title}</Title>
            {classification.product.brand && (
              <Badge color="gray" variant="outline">
                {classification.product.brand}
              </Badge>
            )}
          </Group>
          <Group gap="xs">
            <Badge color="gray" leftSection={<IconClock size={14} />} variant="light">
              {timeSince(classification.timestamp)}
            </Badge>
            {classification.product.price && (
              <Badge color="blue" variant="filled">
                ${classification.product.price.toFixed(2)}
              </Badge>
            )}
          </Group>
        </Group>
      </Card.Section>

      <Stack gap="md">
        <Group align="flex-start" gap="xl">
          {classification.product.image && (
            <Box style={{ flex: '0 0 auto' }}>
              <Image
                width={120}
                alt={classification.product.title}
                fit="cover"
                height={120}
                radius="md"
                src={classification.product.image}
              />
            </Box>
          )}

          <Stack style={{ flex: 1 }} gap="sm">
            <Text c="dimmed" lineClamp={2} size="sm">
              {classification.product.description}
            </Text>

            <div>
              <Text c="dimmed" fw={600} mb={4} size="xs">
                SUGGESTED CATEGORY
              </Text>
              <Code block p="xs">
                {classification.classification.categoryPath.join(' › ')}
              </Code>
            </div>

            <Group gap="xl">
              <div>
                <Text c="dimmed" fw={600} size="xs">
                  CONFIDENCE
                </Text>
                <Group align="center" gap="xs">
                  <Progress
                    color={getConfidenceColor(classification.classification.confidence)}
                    style={{ width: rem(80) }}
                    radius="xl"
                    size="xl"
                    value={classification.classification.confidence * 100}
                  />
                  <Text fw={700} size="sm">
                    {(classification.classification.confidence * 100).toFixed(0)}%
                  </Text>
                </Group>
              </div>

              <div>
                <Text c="dimmed" fw={600} size="xs">
                  METHOD
                </Text>
                <Badge
                  leftSection={getMethodIcon(classification.classification.method)}
                  mt={4}
                  variant="light"
                >
                  {classification.classification.method}
                </Badge>
              </div>
            </Group>

            <div>
              <Text c="dimmed" fw={600} mb={4} size="xs">
                AI REASONING
              </Text>
              <Text style={{ fontStyle: 'italic' }} c="dimmed" size="sm">
                "{classification.classification.reasoning}"
              </Text>
            </div>
          </Stack>
        </Group>

        <Card.Section withBorder inheritPadding pt="sm">
          <Group>
            <Button
              color="green"
              leftSection={<IconThumbUp size={18} />}
              onClick={() => onApprove(classification)}
              style={{ flex: 1 }}
              variant="filled"
            >
              Approve
            </Button>
            <Button
              color="red"
              leftSection={<IconThumbDown size={18} />}
              onClick={() => onReject(classification)}
              style={{ flex: 1 }}
              variant="filled"
            >
              Reject
            </Button>
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={isRerunning}
              onClick={() => onRerun(classification)}
              style={{ flex: 1 }}
              variant="light"
            >
              Re-run
            </Button>
          </Group>
        </Card.Section>
      </Stack>
    </Card>
  );
}
