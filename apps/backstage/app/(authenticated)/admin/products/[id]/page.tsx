import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { IconBarcode, IconEdit, IconExternalLink, IconPhoto, IconScan } from '@tabler/icons-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getRecord } from '../../actions';
import { ProductPreview } from '../../components/ProductPreview';

interface PageProps {
  params: { id: string };
}

export default async function ViewProductPage({ params }: PageProps) {
  const product = await getRecord('product', params.id, {
    _count: {
      select: {
        assets: true,
        barcodes: true,
        scans: true,
      },
    },
    assets: true,
    barcodes: true,
    createdBy: true,
    scans: {
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>{product.name}</Title>
          <Text c="dimmed" mt="xs">
            Product Details
          </Text>
        </div>
        <Group>
          <Button
            href={`http://localhost:3200/en/products/${product.id}`}
            component="a"
            leftSection={<IconExternalLink size={16} />}
            target="_blank"
            variant="light"
          >
            Preview in Web
          </Button>
          <Button
            href={`/admin/products/${product.id}/edit`}
            component={Link}
            leftSection={<IconEdit size={16} />}
          >
            Edit Product
          </Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Basic Information</Title>
                <Badge
                  color={
                    product.status === 'ACTIVE'
                      ? 'green'
                      : product.status === 'DRAFT'
                        ? 'yellow'
                        : product.status === 'ARCHIVED'
                          ? 'gray'
                          : 'red'
                  }
                  size="lg"
                  variant="light"
                >
                  {product.status}
                </Badge>
              </Group>

              <Divider />

              <Grid>
                <Grid.Col span={6}>
                  <Text c="dimmed" size="sm">
                    SKU
                  </Text>
                  <Text fw={500}>{product.sku || 'N/A'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text c="dimmed" size="sm">
                    Brand
                  </Text>
                  <Text fw={500}>{product.brand || 'N/A'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text c="dimmed" size="sm">
                    Price
                  </Text>
                  <Text fw={500}>
                    {product.price ? `${product.currency} ${product.price.toFixed(2)}` : 'N/A'}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text c="dimmed" size="sm">
                    AI Generated
                  </Text>
                  <Badge color={product.aiGenerated ? 'blue' : 'gray'} variant="light">
                    {product.aiGenerated ? 'Yes' : 'No'}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text c="dimmed" size="sm">
                    Description
                  </Text>
                  <Text>{product.description || 'No description provided'}</Text>
                </Grid.Col>
              </Grid>

              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Text c="dimmed" mb="xs" size="sm">
                      Additional Attributes
                    </Text>
                    <Table withColumnBorders>
                      <Table.Tbody>
                        {Object.entries(product.attributes as Record<string, any>).map(
                          ([key, value]) => (
                            <Table.Tr key={key}>
                              <Table.Td fw={500}>{key}</Table.Td>
                              <Table.Td>{JSON.stringify(value)}</Table.Td>
                            </Table.Tr>
                          ),
                        )}
                      </Table.Tbody>
                    </Table>
                  </div>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card withBorder>
              <Stack gap="sm">
                <Title order={4}>Statistics</Title>
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Barcodes
                  </Text>
                  <Badge>{product._count.barcodes}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Assets
                  </Text>
                  <Badge>{product._count.assets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed" size="sm">
                    Total Scans
                  </Text>
                  <Badge>{product._count.scans}</Badge>
                </Group>
              </Stack>
            </Card>

            <Card withBorder>
              <Stack gap="sm">
                <Title order={4}>Metadata</Title>
                <div>
                  <Text c="dimmed" size="sm">
                    Created By
                  </Text>
                  <Text size="sm">{product.createdBy?.name || 'Unknown'}</Text>
                </div>
                <div>
                  <Text c="dimmed" size="sm">
                    Created At
                  </Text>
                  <Text size="sm">{format(new Date(product.createdAt), 'PPp')}</Text>
                </div>
                <div>
                  <Text c="dimmed" size="sm">
                    Updated At
                  </Text>
                  <Text size="sm">{format(new Date(product.updatedAt), 'PPp')}</Text>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      <Tabs defaultValue="barcodes">
        <Tabs.List>
          <Tabs.Tab leftSection={<IconBarcode size={16} />} value="barcodes">
            Barcodes ({product._count.barcodes})
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconPhoto size={16} />} value="assets">
            Assets ({product._count.assets})
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconScan size={16} />} value="scans">
            Recent Scans ({product.scans.length})
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconExternalLink size={16} />} value="preview">
            Web Preview
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel pt="xl" value="barcodes">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Product Barcodes</Title>
              <Button
                href={`/admin/product-barcodes/new?productId=${product.id}`}
                component={Link}
                size="sm"
              >
                Add Barcode
              </Button>
            </Group>
            {product.barcodes.length === 0 ? (
              <Text c="dimmed" py="xl" ta="center">
                No barcodes added yet
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Barcode</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Primary</Table.Th>
                    <Table.Th>Created</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.barcodes.map((barcode: any) => (
                    <Table.Tr key={barcode.id}>
                      <Table.Td fw={500}>{barcode.barcode}</Table.Td>
                      <Table.Td>
                        <Badge variant="light">{barcode.type}</Badge>
                      </Table.Td>
                      <Table.Td>
                        {barcode.isPrimary && (
                          <Badge color="green" variant="light">
                            Primary
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>{format(new Date(barcode.createdAt), 'PP')}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="assets">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Product Assets</Title>
              <Button
                href={`/admin/product-assets/new?productId=${product.id}`}
                component={Link}
                size="sm"
              >
                Add Asset
              </Button>
            </Group>
            {product.assets.length === 0 ? (
              <Text c="dimmed" py="xl" ta="center">
                No assets added yet
              </Text>
            ) : (
              <SimpleGrid cols={{ base: 2, md: 4, sm: 3 }} spacing="md">
                {product.assets.map((asset: any) => (
                  <Card key={asset.id} withBorder p="xs">
                    {asset.type === 'IMAGE' ? (
                      <Image alt={asset.name} fit="cover" height={150} src={asset.url} />
                    ) : (
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          height: 150,
                          justifyContent: 'center',
                        }}
                      >
                        <IconPhoto color="gray" size={48} />
                      </div>
                    )}
                    <Text mt="xs" size="sm" truncate>
                      {asset.name}
                    </Text>
                    <Badge size="xs" variant="light">
                      {asset.type}
                    </Badge>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="scans">
          <Stack gap="md">
            <Title order={4}>Recent Scan History</Title>
            {product.scans.length === 0 ? (
              <Text c="dimmed" py="xl" ta="center">
                No scans recorded yet
              </Text>
            ) : (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Platform</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>User Agent</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {product.scans.map((scan: any) => (
                    <Table.Tr key={scan.id}>
                      <Table.Td>{format(new Date(scan.createdAt), 'PPp')}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {scan.platform}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {scan.country && scan.city ? `${scan.city}, ${scan.country}` : 'Unknown'}
                      </Table.Td>
                      <Table.Td>
                        <Text style={{ maxWidth: 200 }} size="xs" truncate>
                          {scan.userAgent || 'N/A'}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel pt="xl" value="preview">
          <ProductPreview productId={product.id} productName={product.name} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
