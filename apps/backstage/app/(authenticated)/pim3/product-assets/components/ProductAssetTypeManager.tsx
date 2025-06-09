'use client';

import { Badge, Button, Card, Grid, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCertificate,
  IconFile,
  IconFileText,
  IconPhoto,
  IconSettings,
  IconVideo,
} from '@tabler/icons-react';
import { useState } from 'react';

import type { AssetType } from '@repo/database/prisma';

interface AssetTypeConfig {
  allowedFormats: string[];
  color: string;
  description: string;
  icon: React.ReactNode;
  maxSize: number;
  organizationRules: string[];
  type: AssetType;
  validationRules: string[];
}

const ASSET_TYPE_CONFIGS: AssetTypeConfig[] = [
  {
    validationRules: [
      'Minimum resolution: 800x800px',
      'Maximum resolution: 4000x4000px',
      'Alt text required for SEO',
      'Consistent lighting and background preferred',
    ],
    type: 'IMAGE',
    allowedFormats: ['JPG', 'PNG', 'WebP', 'AVIF'],
    color: 'blue',
    description: 'Product images including hero shots, gallery images, and lifestyle photos',
    icon: <IconPhoto size={24} />,
    maxSize: 10 * 1024 * 1024, // 10MB
    organizationRules: [
      'Group by product variant',
      'Primary image should be square (1:1)',
      'Use consistent naming: productSku_variant_angle.jpg',
      'Sort order: hero, front, back, side, detail, lifestyle',
    ],
  },
  {
    validationRules: [
      'Maximum duration: 5 minutes',
      'Minimum resolution: 720p',
      'Recommended format: MP4 H.264',
      'Include video thumbnail',
    ],
    type: 'VIDEO',
    allowedFormats: ['MP4', 'WebM', 'MOV'],
    color: 'violet',
    description: 'Product demonstration videos, 360° views, and promotional content',
    icon: <IconVideo size={24} />,
    maxSize: 100 * 1024 * 1024, // 100MB
    organizationRules: [
      'One primary demo video per product',
      'Additional videos for different use cases',
      'Name format: productSku_demo.mp4',
      'Provide multiple quality versions if possible',
    ],
  },
  {
    validationRules: [
      'Searchable text (not scanned images)',
      'Clear document structure',
      'Professional formatting',
      'Include table of contents for long documents',
    ],
    type: 'DOCUMENT',
    allowedFormats: ['PDF', 'DOC', 'DOCX'],
    color: 'orange',
    description: 'General product documentation and information sheets',
    icon: <IconFileText size={24} />,
    maxSize: 20 * 1024 * 1024, // 20MB
    organizationRules: [
      'Group by document type',
      'Version control in filename',
      'Name format: productSku_docType_v1.pdf',
      'Keep documents updated with product changes',
    ],
  },
  {
    validationRules: [
      'Must be PDF format',
      'Searchable text required',
      'Clear step-by-step instructions',
      'Include safety warnings if applicable',
      'Multilingual versions supported',
    ],
    type: 'MANUAL',
    allowedFormats: ['PDF'],
    color: 'teal',
    description: 'User manuals, instruction guides, and setup documentation',
    icon: <IconFileText size={24} />,
    maxSize: 50 * 1024 * 1024, // 50MB
    organizationRules: [
      'One master manual per product',
      'Language versions in separate files',
      'Name format: productSku_manual_en.pdf',
      'Update with product revisions',
    ],
  },
  {
    validationRules: [
      'Technical accuracy required',
      'Include all relevant measurements',
      'Specify units clearly',
      'Professional technical formatting',
    ],
    type: 'SPECIFICATION',
    allowedFormats: ['PDF', 'DOC', 'DOCX'],
    color: 'indigo',
    description: 'Technical specifications, datasheets, and detailed product information',
    icon: <IconFile size={24} />,
    maxSize: 10 * 1024 * 1024, // 10MB
    organizationRules: [
      'One specification sheet per product',
      'Include revision date',
      'Name format: productSku_specs_v1.pdf',
      'Link to related compliance documents',
    ],
  },
  {
    validationRules: [
      'Official letterhead must be visible',
      'Valid date range required',
      'High resolution for verification',
      'Digital signature preferred',
    ],
    type: 'CERTIFICATE',
    allowedFormats: ['PDF', 'JPG', 'PNG'],
    color: 'red',
    description: 'Quality certificates, compliance documents, and test reports',
    icon: <IconCertificate size={24} />,
    maxSize: 15 * 1024 * 1024, // 15MB
    organizationRules: [
      'Group by certification type',
      'Include expiration tracking',
      'Name format: productSku_certType_YYYY.pdf',
      'Monitor and update before expiration',
    ],
  },
  {
    validationRules: [
      'Clear file purpose documented',
      'Appropriate file format',
      'Descriptive filename',
    ],
    type: 'OTHER',
    allowedFormats: ['Various'],
    color: 'gray',
    description: "Miscellaneous files that don't fit other categories",
    icon: <IconFile size={24} />,
    maxSize: 25 * 1024 * 1024, // 25MB
    organizationRules: [
      'Use specific categories when possible',
      'Document purpose in description',
      'Review regularly for proper categorization',
    ],
  },
];

interface ProductAssetTypeManagerProps {
  detailed?: boolean;
}

interface AssetTypeCardProps {
  config: AssetTypeConfig;
  onConfigure: (type: AssetType) => void;
}

function AssetTypeCard({ config, onConfigure }: AssetTypeCardProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="sm">
            <div style={{ color: `var(--mantine-color-${config.color}-6)` }}>{config.icon}</div>
            <div>
              <Text fw={500}>{config.type}</Text>
              <Text c="dimmed" size="xs">
                Max: {formatFileSize(config.maxSize)}
              </Text>
            </div>
          </Group>
          <Button
            leftSection={<IconSettings size={14} />}
            onClick={() => onConfigure(config.type)}
            size="xs"
            variant="light"
          >
            Configure
          </Button>
        </Group>

        <Text c="dimmed" lineClamp={2} size="sm">
          {config.description}
        </Text>

        <Group gap="xs">
          {config.allowedFormats.slice(0, 3).map((format) => (
            <Badge key={format} size="xs" variant="light">
              {format}
            </Badge>
          ))}
          {config.allowedFormats.length > 3 && (
            <Badge color="gray" size="xs" variant="light">
              +{config.allowedFormats.length - 3}
            </Badge>
          )}
        </Group>
      </Stack>
    </Card>
  );
}

function AssetTypeDetailModal({
  config,
  onClose,
  opened,
}: {
  config: AssetTypeConfig | null;
  opened: boolean;
  onClose: () => void;
}) {
  if (!config) return null;

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal onClose={onClose} opened={opened} size="lg" title={`${config.type} Configuration`}>
      <Stack gap="lg">
        <Group>
          <div style={{ color: `var(--mantine-color-${config.color}-6)` }}>{config.icon}</div>
          <div>
            <Title order={4}>{config.type}</Title>
            <Text c="dimmed">{config.description}</Text>
          </div>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Stack gap="sm">
                <Text fw={500} size="sm">
                  Allowed Formats
                </Text>
                <Group gap="xs">
                  {config.allowedFormats.map((format) => (
                    <Badge key={format} variant="light">
                      {format}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper withBorder p="md">
              <Stack gap="sm">
                <Text fw={500} size="sm">
                  Size Limit
                </Text>
                <Text c={config.color} fw={600} size="lg">
                  {formatFileSize(config.maxSize)}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        <div>
          <Text fw={500} mb="sm">
            Validation Rules
          </Text>
          <Stack gap="xs">
            {config.validationRules.map((rule, index) => (
              <Group key={index} gap="xs">
                <Text c="dimmed" size="sm">
                  •
                </Text>
                <Text size="sm">{rule}</Text>
              </Group>
            ))}
          </Stack>
        </div>

        <div>
          <Text fw={500} mb="sm">
            Organization Guidelines
          </Text>
          <Stack gap="xs">
            {config.organizationRules.map((rule, index) => (
              <Group key={index} gap="xs">
                <Text c="dimmed" size="sm">
                  •
                </Text>
                <Text size="sm">{rule}</Text>
              </Group>
            ))}
          </Stack>
        </div>

        <Group justify="flex-end">
          <Button onClick={onClose} variant="light">
            Close
          </Button>
          <Button>Save Configuration</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function ProductAssetTypeManager({ detailed = false }: ProductAssetTypeManagerProps) {
  const [detailOpened, { close: closeDetail, open: openDetail }] = useDisclosure();
  const [selectedConfig, setSelectedConfig] = useState<AssetTypeConfig | null>(null);

  const handleConfigure = (type: AssetType) => {
    const config = ASSET_TYPE_CONFIGS.find((c) => c.type === type);
    if (config) {
      setSelectedConfig(config);
      openDetail();
    }
  };

  if (!detailed) {
    return (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={5}>Asset Types</Title>
            <Text c="dimmed" size="xs">
              {ASSET_TYPE_CONFIGS.length} types
            </Text>
          </Group>

          <Stack gap="xs">
            {ASSET_TYPE_CONFIGS.slice(0, 4).map((config) => (
              <Group key={config.type} gap="sm">
                <div style={{ color: `var(--mantine-color-${config.color}-6)` }}>{config.icon}</div>
                <div style={{ flex: 1 }}>
                  <Text fw={500} size="sm">
                    {config.type}
                  </Text>
                  <Text c="dimmed" lineClamp={1} size="xs">
                    {config.description}
                  </Text>
                </div>
              </Group>
            ))}
            {ASSET_TYPE_CONFIGS.length > 4 && (
              <Text c="dimmed" pt="xs" size="xs" ta="center">
                +{ASSET_TYPE_CONFIGS.length - 4} more types
              </Text>
            )}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Stack gap="lg">
        <div>
          <Title order={3}>Asset Type Management</Title>
          <Text c="dimmed">
            Configure validation rules, file size limits, and organization guidelines for each asset
            type.
          </Text>
        </div>

        <Grid>
          {ASSET_TYPE_CONFIGS.map((config) => (
            <Grid.Col key={config.type} span={{ base: 12, md: 4, sm: 6 }}>
              <AssetTypeCard config={config} onConfigure={handleConfigure} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>

      <AssetTypeDetailModal config={selectedConfig} onClose={closeDetail} opened={detailOpened} />
    </>
  );
}
