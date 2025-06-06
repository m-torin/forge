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

import type { ProductData } from '../../shared/types/classification';

interface ProductClassifierUIProps {
  api?: string;
  onResult?: (result: any) => void;
}

export const ProductClassifierUI = ({ api, onResult }: ProductClassifierUIProps) => {
  const [product, setProduct] = useState<Partial<ProductData>>({
    id: '',
    brand: '',
    description: '',
    price: undefined,
    title: '',
  });

  const { classify, clear, error, isClassifying, result } = useClassification({
    api,
    onSuccess: onResult,
  });

  const handleClassify = useCallback(async () => {
    if (!product.title || !product.description) {
      return;
    }

    const productData: ProductData = {
      id: product.id || Date.now().toString(),
      brand: product.brand,
      description: product.description,
      price: product.price,
      title: product.title,
    };

    await classify(productData);
  }, [product, classify]);

  const handleClear = useCallback(() => {
    clear();
    setProduct({
      id: '',
      brand: '',
      description: '',
      price: undefined,
      title: '',
    });
  }, [clear]);

  const isValid = product.title && product.description;

  return (
    <Box style={{ maxWidth: 800, margin: '0 auto' }}>
      <Stack gap="md">
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Group justify="space-between">
              <Text fw={600}>Product Classification</Text>
              <IconBrain size={20} />
            </Group>
          </Card.Section>

          <Stack gap="md" mt="md">
            <TextInput
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setProduct((prev) => ({ ...prev, id: event.currentTarget.value }))
              }
              placeholder="Auto-generated if empty"
              label="Product ID"
              value={product.id}
            />

            <TextInput
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setProduct((prev) => ({ ...prev, title: event.currentTarget.value }))
              }
              placeholder="Enter product title"
              label="Product Title"
              required
              value={product.title}
            />

            <Textarea
              minRows={3}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setProduct((prev) => ({ ...prev, description: event.currentTarget.value }))
              }
              placeholder="Enter detailed product description"
              label="Product Description"
              required
              value={product.description}
            />

            <Group grow>
              <TextInput
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setProduct((prev) => ({ ...prev, brand: event.currentTarget.value }))
                }
                placeholder="Product brand"
                label="Brand"
                value={product.brand}
              />

              <NumberInput
                onChange={(value: string | number) =>
                  setProduct((prev) => ({ ...prev, price: value as number | undefined }))
                }
                placeholder="Product price"
                decimalScale={2}
                fixedDecimalScale
                label="Price"
                min={0}
                value={product.price}
              />
            </Group>

            <Group justify="space-between">
              <Button onClick={handleClear} disabled={isClassifying} variant="outline">
                Clear
              </Button>

              <Button
                loading={isClassifying}
                onClick={handleClassify}
                disabled={!isValid || isClassifying}
              >
                Classify Product
              </Button>
            </Group>
          </Stack>
        </Card>

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Classification Error">
            {error.message}
          </Alert>
        )}

        {result && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Text fw={600}>Classification Result</Text>
                <IconCheck color="green" size={20} />
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Group align="center" justify="space-between">
                <Text fw={500}>Category:</Text>
                <Badge size="lg" variant="filled">
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
                  radius="md"
                  size="lg"
                  value={result.confidence * 100}
                />
                <Text c="dimmed" mt={2} size="sm">
                  {(result.confidence * 100).toFixed(1)}%
                </Text>
              </Box>

              {result.path && result.path.length > 0 && (
                <Box>
                  <Text fw={500} mb={5}>
                    Category Path:
                  </Text>
                  <Group gap={4}>
                    {result.path.map((category, index) => (
                      <Box
                        key={`${category}-${index}`}
                        style={{ alignItems: 'center', display: 'flex' }}
                      >
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
