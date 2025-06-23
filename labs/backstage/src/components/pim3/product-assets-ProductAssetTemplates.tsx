'use client';

import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  List,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconCertificate,
  IconCheck,
  IconFile,
  IconFileText,
  IconPhoto,
  IconTemplate,
  IconUpload,
  IconVideo,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { getAssetTemplates } from '@/actions/pim3/actions';

import type { MediaType } from '@repo/database/prisma';

interface AssetTemplate {
  description: string;
  dimensions?: { width: number; height: number };
  formats: string[];
  id: string;
  maxSize: number;
  name: string;
  requirements: string[];
  type: MediaType;
}

interface AssetTemplateCardProps {
  onPreview: (template: AssetTemplate) => void;
  onUse: (template: AssetTemplate) => void;
  template: AssetTemplate;
}

function AssetTemplateCard({ onPreview, onUse, template }: AssetTemplateCardProps) {
  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return <IconPhoto size={24} />;
      case 'VIDEO':
        return <IconVideo size={24} />;
      case 'DOCUMENT':
      case 'MANUAL':
      case 'SPECIFICATION':
        return <IconFileText size={24} />;
      case 'CERTIFICATE':
        return <IconCertificate size={24} />;
      default:
        return <IconFile size={24} />;
    }
  };

  const getTypeColor = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return 'blue';
      case 'VIDEO':
        return 'violet';
      case 'DOCUMENT':
        return 'orange';
      case 'MANUAL':
        return 'teal';
      case 'SPECIFICATION':
        return 'indigo';
      case 'CERTIFICATE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon color={getTypeColor(template.type)} size="lg" variant="light">
              {getTypeIcon(template.type)}
            </ThemeIcon>
            <div>
              <Text fw={500}>{template.name}</Text>
              <Badge color={getTypeColor(template.type)} size="sm" variant="light">
                {template.type}
              </Badge>
            </div>
          </Group>
          <Button onClick={() => onPreview(template)} size="xs" variant="light">
            Preview
          </Button>
        </Group>

        <Text c="dimmed" lineClamp={2} size="sm">
          {template.description}
        </Text>

        <Group gap="md">
          {template.dimensions && (
            <div>
              <Text c="dimmed" fw={500} size="xs">
                Dimensions
              </Text>
              <Text size="sm">
                {template.dimensions.width} × {template.dimensions.height}
              </Text>
            </div>
          )}

          <div>
            <Text c="dimmed" fw={500} size="xs">
              Max Size
            </Text>
            <Text size="sm">{formatFileSize(template.maxSize)}</Text>
          </div>
        </Group>

        <Group gap="xs">
          {template.formats.slice(0, 3).map((format) => (
            <Badge key={format} size="xs" variant="outline">
              {format}
            </Badge>
          ))}
          {template.formats.length > 3 && (
            <Badge color="gray" size="xs" variant="outline">
              +{template.formats.length - 3}
            </Badge>
          )}
        </Group>

        <Button fullWidth leftSection={<IconUpload size={16} />} onClick={() => onUse(template)}>
          Use Template
        </Button>
      </Stack>
    </Card>
  );
}

interface TemplateDetailModalProps {
  onClose: () => void;
  onUse: (template: AssetTemplate) => void;
  opened: boolean;
  template: AssetTemplate | null;
}

function TemplateDetailModal({ onClose, onUse, opened, template }: TemplateDetailModalProps) {
  if (!template) return null;

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return <IconPhoto size={24} />;
      case 'VIDEO':
        return <IconVideo size={24} />;
      case 'DOCUMENT':
      case 'MANUAL':
      case 'SPECIFICATION':
        return <IconFileText size={24} />;
      case 'CERTIFICATE':
        return <IconCertificate size={24} />;
      default:
        return <IconFile size={24} />;
    }
  };

  const getTypeColor = (type: MediaType) => {
    switch (type) {
      case 'IMAGE':
        return 'blue';
      case 'VIDEO':
        return 'violet';
      case 'DOCUMENT':
        return 'orange';
      case 'MANUAL':
        return 'teal';
      case 'SPECIFICATION':
        return 'indigo';
      case 'CERTIFICATE':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal onClose={onClose} opened={opened} size="lg" title={template.name}>
      <Stack gap="lg">
        <Group>
          <ThemeIcon color={getTypeColor(template.type)} size="xl" variant="light">
            {getTypeIcon(template.type)}
          </ThemeIcon>
          <div>
            <Title order={4}>{template.name}</Title>
            <Text c="dimmed">{template.description}</Text>
            <Badge color={getTypeColor(template.type)} mt="xs" variant="light">
              {template.type}
            </Badge>
          </div>
        </Group>

        <Grid>
          {template.dimensions && (
            <Grid.Col span={6}>
              <Paper withBorder p="md">
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Dimensions
                  </Text>
                  <Text fw={600} size="lg">
                    {template.dimensions.width} × {template.dimensions.height}
                  </Text>
                  <Text c="dimmed" size="xs">
                    Pixels (recommended)
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col>
          )}

          <Grid.Col span={template.dimensions ? 6 : 12}>
            <Paper withBorder p="md">
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Maximum File Size
                </Text>
                <Text c={getTypeColor(template.type)} fw={600} size="lg">
                  {formatFileSize(template.maxSize)}
                </Text>
                <Text c="dimmed" size="xs">
                  Recommended limit
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <div>
          <Text fw={500} mb="sm">
            Supported Formats
          </Text>
          <Group gap="xs">
            {template.formats.map((format) => (
              <Badge key={format} variant="light">
                {format}
              </Badge>
            ))}
          </Group>
        </div>

        <div>
          <Text fw={500} mb="sm">
            Requirements & Guidelines
          </Text>
          <List
            icon={
              <ThemeIcon color="green" radius="xl" size={20}>
                <IconCheck size={12} />
              </ThemeIcon>
            }
            size="sm"
            spacing="xs"
          >
            {template.requirements.map((requirement, index) => (
              <List.Item key={index}>{requirement}</List.Item>
            ))}
          </List>
        </div>

        <Group justify="flex-end" mt="md">
          <Button onClick={onClose} variant="light">
            Close
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={() => {
              onUse(template);
              onClose();
            }}
          >
            Use This Template
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function ProductAssetTemplates() {
  const [templates, setTemplates] = useState<AssetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null);
  const [detailOpened, { close: closeDetail, open: openDetail }] = useDisclosure();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await getAssetTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        notifications.show({
          color: 'red',
          message: result.error || 'Failed to load templates',
          title: 'Error',
        });
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to load templates',
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (template: AssetTemplate) => {
    setSelectedTemplate(template);
    openDetail();
  };

  const handleUse = (template: AssetTemplate) => {
    // In a real implementation, this would:
    // 1. Open the upload modal with template pre-configured
    // 2. Apply template validation rules
    // 3. Set default metadata based on template

    notifications.show({
      color: 'blue',
      message: `Template "${template.name}" selected. Upload interface would open with these settings.`,
      title: 'Template Applied',
    });
  };

  if (loading) {
    return (
      <Grid>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, md: 3, sm: 6 }}>
            <Card withBorder>
              <div style={{ height: 200 }} />
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <div>
          <Title order={3}>Asset Templates</Title>
          <Text c="dimmed">
            Pre-configured templates with validation rules and guidelines for consistent asset
            creation.
          </Text>
        </div>

        <Paper withBorder p="md">
          <Group gap="md">
            <ThemeIcon color="blue" size="lg" variant="light">
              <IconTemplate size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text fw={500}>Why Use Templates?</Text>
              <Text c="dimmed" size="sm">
                Templates ensure consistent quality, proper sizing, and optimal organization of your
                product assets. They include validation rules, format requirements, and best
                practices for each asset type.
              </Text>
            </div>
          </Group>
        </Paper>

        <Grid>
          {templates.map((template) => (
            <Grid.Col key={template.id} span={{ base: 12, lg: 3, md: 4, sm: 6 }}>
              <AssetTemplateCard onPreview={handlePreview} onUse={handleUse} template={template} />
            </Grid.Col>
          ))}
        </Grid>

        {templates.length === 0 && (
          <Paper withBorder p="xl" ta="center">
            <Stack align="center" gap="md">
              <IconTemplate color="gray" size={48} />
              <div>
                <Text fw={500}>No Templates Available</Text>
                <Text c="dimmed" size="sm">
                  Asset templates will be loaded here when available
                </Text>
              </div>
            </Stack>
          </Paper>
        )}
      </Stack>

      <TemplateDetailModal
        onClose={closeDetail}
        onUse={handleUse}
        opened={detailOpened}
        template={selectedTemplate}
      />
    </>
  );
}
