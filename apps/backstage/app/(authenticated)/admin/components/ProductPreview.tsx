'use client';

import {
  Alert,
  Button,
  Card,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconExternalLink,
  IconRefresh,
} from '@tabler/icons-react';
import { useState } from 'react';

interface ProductPreviewProps {
  productId: string;
  productName?: string;
}

const LOCALES = [
  { label: 'English', value: 'en' },
  { label: 'Français', value: 'fr' },
  { label: 'Español', value: 'es' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
];

const VIEWPORTS = {
  desktop: { width: '100%', height: '800px' },
  mobile: { width: '375px', height: '667px' },
  tablet: { width: '768px', height: '1024px' },
};

export function ProductPreview({ productId, productName }: ProductPreviewProps) {
  const [locale, setLocale] = useState('en');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0); // For force refresh

  const previewUrl = `http://localhost:3200/${locale}/products/${productId}`;
  const viewportSettings = VIEWPORTS[viewport];

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
    setIsLoading(true);
    setHasError(false);
  };

  return (
    <Stack gap="md">
      <div>
        <Title order={4}>Product Preview</Title>
        <Text c="dimmed" size="sm">
          Preview how {productName || 'this product'} appears in the customer-facing web application
        </Text>
      </div>

      <Group justify="space-between" wrap="wrap">
        <Group>
          <Select
            onChange={(value) => value && setLocale(value)}
            style={{ width: 150 }}
            data={LOCALES}
            label="Language"
            value={locale}
          />
          <div>
            <Text c="dimmed" mb={4} size="xs">
              Device Preview
            </Text>
            <SegmentedControl
              onChange={(value) => setViewport(value as typeof viewport)}
              data={[
                { label: <IconDeviceDesktop size={16} />, value: 'desktop' },
                { label: <IconDeviceMobile size={16} />, value: 'mobile' },
              ]}
              value={viewport}
            />
          </div>
        </Group>
        <Group>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            size="sm"
            variant="subtle"
          >
            Refresh
          </Button>
          <Button
            href={previewUrl}
            component="a"
            leftSection={<IconExternalLink size={16} />}
            size="sm"
            target="_blank"
            variant="light"
          >
            Open in New Tab
          </Button>
        </Group>
      </Group>

      {hasError && (
        <Alert color="red" title="Preview Error">
          Unable to load preview. Make sure the web app is running on port 3200.
        </Alert>
      )}

      <Card
        withBorder
        style={{
          alignItems: 'flex-start',
          background: viewport !== 'desktop' ? '#f5f5f5' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          minHeight: viewportSettings.height,
          overflow: 'hidden',
        }}
        p={0}
      >
        {isLoading && !hasError && (
          <Center style={{ background: 'white', inset: 0, position: 'absolute', zIndex: 10 }}>
            <Stack align="center">
              <Loader />
              <Text c="dimmed" size="sm">
                Loading preview...
              </Text>
            </Stack>
          </Center>
        )}
        <div
          style={{
            width: viewportSettings.width,
            borderRadius: viewport === 'mobile' ? '20px' : '0',
            boxShadow: viewport !== 'desktop' ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
            height: viewportSettings.height,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <iframe
            key={key}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onLoad={() => setIsLoading(false)}
            style={{
              width: '100%',
              border: 'none',
              height: '100%',
            }}
            src={previewUrl}
            title={`Product Preview - ${locale}`}
          />
        </div>
      </Card>

      {viewport !== 'desktop' && (
        <Text c="dimmed" size="xs" ta="center">
          {viewport === 'mobile' ? 'iPhone 8 (375×667)' : 'iPad (768×1024)'} preview
        </Text>
      )}
    </Stack>
  );
}
