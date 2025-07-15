'use client';

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  NumberInput,
  Progress,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconBrain, IconCheck } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { useClassification } from '../../hooks/use-classification';

import { ProductData } from '../../shared/types/classification';

interface ProductClassifierUIProps extends Record<string, any> {
  api?: string;
  onResult?: (result: any) => void;
}

export const ProductClassifierUI = ({ api, onResult }: ProductClassifierUIProps) => {
  const [product, setProduct] = useState<Partial<ProductData>>({
    brand: '',
    description: '',
    id: '',
    title: '',
  });

  const { classify, clear, error, isClassifying, result } = useClassification({
    ...(api && { api }),
    ...(onResult && { onSuccess: onResult }),
  });

  const handleClassify = useCallback(async () => {
    if (!product.title || !product.description) {
      return;
    }

    const productData: ProductData = {
      description: product.description || '',
      id: product.id || Date.now().toString(),
      title: product.title || '',
      ...(product.brand && { brand: product.brand }),
      ...(typeof product.price === 'number' && { price: product.price }),
    };

    await classify(productData);
  }, [product, classify]);

  const handleClear = useCallback(() => {
    clear();
    setProduct({
      brand: '',
      description: '',
      id: '',
      title: '',
    });
  }, [clear]);

  const isValid = product.title && product.description;

  return (
    <Box style={{ margin: '0 auto', maxWidth: 800 }}>
      <Stack gap="md">
        <Card withBorder={true}>
          <Card.Section inheritPadding py="xs" withBorder={true}>
            <Group justify="space-between">
              <Text fw={600}>Product Classification</Text>
              <IconBrain size={20} />
            </Group>
          </Card.Section>

          <Stack gap="md" mt="md">
            <TextInput
              label="Product ID"
              placeholder="Auto-generated if empty"
              value={product.id}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setProduct((prev: any) => ({ ...prev, id: event.currentTarget.value }))
              }
            />

            <TextInput
              label="Product Title"
              placeholder="Enter product title"
              required
              value={product.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setProduct((prev: any) => ({ ...prev, title: event.currentTarget.value }))
              }
            />

            <Textarea
              label="Product Description"
              minRows={3}
              placeholder="Enter detailed product description"
              required
              value={product.description}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProduct((prev: any) => ({ ...prev, description: event.currentTarget.value }))
              }
            />

            <Group grow>
              <TextInput
                label="Brand"
                placeholder="Product brand"
                value={product.brand}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setProduct((prev: any) => ({ ...prev, brand: event.currentTarget.value }))
                }
              />

              <NumberInput
                decimalScale={2}
                fixedDecimalScale
                label="Price"
                min={0}
                placeholder="Product price"
                value={product.price ?? ''}
                onChange={(value: number | string) =>
                  setProduct((prev: any) => ({
                    ...prev,
                    price: typeof value === 'number' ? value : undefined,
                  }))
                }
              />
            </Group>

            <Group justify="space-between">
              <Button disabled={isClassifying} variant="outline" onClick={handleClear}>
                Clear
              </Button>

              <Button
                disabled={!isValid || isClassifying}
                loading={isClassifying}
                onClick={() => void handleClassify()}
              >
                Classify Product
              </Button>
            </Group>
          </Stack>
        </Card>

        {error && (
          <Alert c="red" icon={<IconAlertCircle size={16} />} title="Classification Error">
            {(error as Error)?.message || 'Unknown error'}
          </Alert>
        )}

        {result && (
          <Card withBorder={true}>
            <Card.Section inheritPadding py="xs" withBorder={true}>
              <Group justify="space-between">
                <Text fw={600}>Classification Result</Text>
                <IconCheck color="green" size={20} />
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Group ta="center" justify="space-between">
                <Text fw={500}>Category:</Text>
                <Badge size="lg" variant="light">
                  {result.categoryId}
                </Badge>
              </Group>

              <Box>
                <Text fw={500} mb={5}>
                  Confidence:
                </Text>
                <Progress
                  color={
                    result.confidence > 0.8 ? 'green' : result.confidence > 0.6 ? 'yellow' : 'red'
                  }
                  radius="sm"
                  size="lg"
                  value={result.confidence * 100}
                />
                <Text c="dimmed" mt={2} size="sm">
                  {(result.confidence * 100).toFixed(1)}%
                </Text>
              </Box>

              {result.path && (
                <Box>
                  <Text fw={500} mb={5}>
                    Category Path:
                  </Text>
                  <Group gap={4}>
                    {result.path.map((category, index: any) => (
                      <Box key={category} style={{ alignItems: 'center', display: 'flex' }}>
                        {index > 0 && (
                          <Text c="dimmed" mx={4}>
                            →
                          </Text>
                        )}
                        <Badge size="sm" variant="outline">
                          {category}
                        </Badge>
                      </Box>
                    ))}
                  </Group>
                </Box>
              )}

              {result.reasoning && (
                <Box>
                  <Text fw={500} mb={5}>
                    Reasoning:
                  </Text>
                  <Text c="dimmed" size="sm">
                    {result.reasoning}
                  </Text>
                </Box>
              )}
            </Stack>
          </Card>
        )}
      </Stack>

      <LoadingOverlay visible={isClassifying} />
    </Box>
  );
};
