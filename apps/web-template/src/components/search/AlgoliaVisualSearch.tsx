'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Grid,
  Badge,
  Group,
  Button,
  Image,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  FileInput,
  Progress,
  Skeleton,
  Modal,
  ActionIcon,
  Center,
  Slider,
  Switch,
  Tabs,
} from '@mantine/core';
import {
  IconPhoto,
  IconUpload,
  IconCamera,
  IconSearch,
  IconX,
  IconEye,
  IconBrandAlgolia,
  IconStar,
  IconShoppingCart,
  IconAdjustments,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Types for Visual Search
interface VisualSearchResult {
  objectID: string;
  name: string;
  brand?: string;
  price: number;
  image: string;
  similarity: number;
  category: string;
  colors?: string[];
  attributes?: {
    material?: string;
    style?: string;
    season?: string;
  };
  rating?: number;
}

interface ImageAnalysis {
  dominantColors: { color: string; percentage: number }[];
  detectedObjects: { name: string; confidence: number; bbox?: number[] }[];
  style: string;
  category: string;
  attributes: Record<string, any>;
}

// Mock visual search results
const mockResults: VisualSearchResult[] = [
  {
    objectID: 'vs-1',
    name: 'Wireless Noise-Canceling Headphones',
    brand: 'AudioTech',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    similarity: 0.94,
    category: 'Electronics',
    colors: ['black', 'silver'],
    attributes: {
      material: 'plastic',
      style: 'over-ear',
    },
    rating: 4.8,
  },
  {
    objectID: 'vs-2',
    name: 'Premium Over-Ear Headphones',
    brand: 'SoundMax',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=300&h=300&fit=crop',
    similarity: 0.89,
    category: 'Electronics',
    colors: ['black', 'gold'],
    attributes: {
      material: 'leather',
      style: 'over-ear',
    },
    rating: 4.6,
  },
  {
    objectID: 'vs-3',
    name: 'Studio Monitor Headphones',
    brand: 'ProAudio',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
    similarity: 0.85,
    category: 'Electronics',
    colors: ['black'],
    attributes: {
      material: 'plastic',
      style: 'on-ear',
    },
    rating: 4.7,
  },
  {
    objectID: 'vs-4',
    name: 'Gaming Headset RGB',
    brand: 'GameMax',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=300&h=300&fit=crop',
    similarity: 0.78,
    category: 'Gaming',
    colors: ['black', 'red'],
    attributes: {
      material: 'plastic',
      style: 'over-ear',
    },
    rating: 4.4,
  },
];

// Mock image analysis
const mockAnalysis: ImageAnalysis = {
  dominantColors: [
    { color: '#000000', percentage: 45 },
    { color: '#333333', percentage: 30 },
    { color: '#666666', percentage: 15 },
    { color: '#CCCCCC', percentage: 10 },
  ],
  detectedObjects: [
    { name: 'headphones', confidence: 0.96 },
    { name: 'electronics', confidence: 0.89 },
    { name: 'audio device', confidence: 0.84 },
  ],
  style: 'modern',
  category: 'Electronics > Audio > Headphones',
  attributes: {
    shape: 'over-ear',
    material: 'synthetic',
    finish: 'matte',
  },
};

// Visual search result card
function VisualSearchResultCard({ result }: { result: VisualSearchResult }) {
  const [imageError, setImageError] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleAddToCart = () => {
    try {
      // Add to cart logic here
      console.log('Adding to cart:', result.objectID);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setInternalError('Failed to add to cart');
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            <Text size="xs">Product card failed to load</Text>
          </Alert>
        </Card>
      }
    >
      <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
        {internalError && (
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light" mb="xs">
            <Text size="xs">{internalError}</Text>
          </Alert>
        )}
        <Card.Section>
          {imageError ? (
            <Center h={200} style={{ backgroundColor: '#f0f0f0' }}>
              <Stack align="center" gap="xs">
                <IconPhoto size={48} style={{ color: '#999' }} />
                <Text size="xs" c="dimmed">
                  Image unavailable
                </Text>
              </Stack>
            </Center>
          ) : (
            <Image
              src={result.image}
              height={200}
              alt={result.name}
              fit="cover"
              onError={() => setImageError(true)}
            />
          )}
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Text fw={600} size="md" lineClamp={2}>
                {result.name}
              </Text>
              {result.brand && (
                <Text size="xs" c="dimmed">
                  {result.brand}
                </Text>
              )}
            </div>
            <Badge c="blue" variant="light" size="md">
              {Math.round(result.similarity * 100)}% match
            </Badge>
          </Group>

          {result.rating && (
            <Group gap="xs">
              <IconStar size={14} fill="currentColor" style={{ color: '#ffd43b' }} />
              <Text size="xs" c="dimmed">
                {result.rating} rating
              </Text>
            </Group>
          )}

          <Text fw={700} size="lg" c="blue">
            ${result.price}
          </Text>

          {result.colors && (
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                Colors:
              </Text>
              {result.colors.map((color) => (
                <div
                  key={color}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: color,
                    border: '1px solid #ddd',
                  }}
                  title={color}
                />
              ))}
            </Group>
          )}

          <Button
            fullWidth
            size="md"
            variant="light"
            leftSection={<IconShoppingCart size={16} />}
            mt="xs"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </Stack>
      </Card>
    </ErrorBoundary>
  );
}

// Image analysis display
function ImageAnalysisDisplay({ analysis }: { analysis: ImageAnalysis }) {
  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Title order={4} mb="md">
        AI Image Analysis
      </Title>

      <Stack gap="md">
        {/* Detected objects */}
        <div>
          <Text size="md" fw={600} mb="xs">
            Detected Objects
          </Text>
          <Group gap="xs">
            {analysis.detectedObjects.map((obj, i) => (
              <Badge key={i} variant="light" color="green">
                {obj.name} ({Math.round(obj.confidence * 100)}%)
              </Badge>
            ))}
          </Group>
        </div>

        {/* Category */}
        <div>
          <Text size="md" fw={600} mb="xs">
            Category
          </Text>
          <Badge variant="light" color="blue">
            {analysis.category}
          </Badge>
        </div>

        {/* Dominant colors */}
        <div>
          <Text size="md" fw={600} mb="xs">
            Dominant Colors
          </Text>
          <Stack gap="xs">
            {analysis.dominantColors.map((colorData, i) => (
              <Group key={i} gap="xs">
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: colorData.color,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                  }}
                />
                <Text size="xs">{colorData.color}</Text>
                <Text size="xs" c="dimmed">
                  ({colorData.percentage}%)
                </Text>
              </Group>
            ))}
          </Stack>
        </div>

        {/* Attributes */}
        <div>
          <Text size="md" fw={600} mb="xs">
            Detected Attributes
          </Text>
          <Group gap="xs">
            {Object.entries(analysis.attributes).map(([key, value]: [string, any]) => (
              <Badge key={key} variant="outline" size="md">
                {key}: {value}
              </Badge>
            ))}
          </Group>
        </div>
      </Stack>
    </Card>
  );
}

// Camera capture modal
function CameraCapture({
  opened,
  onClose,
  onCapture,
}: {
  opened: boolean;
  onClose: () => void;
  onCapture: (imageUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    try {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageUrl = canvas.toDataURL('image/jpeg');
          onCapture(imageUrl);
          stopCamera();
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      setCameraError('Failed to capture photo');
    }
  };

  React.useEffect(() => {
    if (opened) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Capture Photo" size="lg" centered>
      <ErrorBoundary
        fallback={
          <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
            <Text size="sm">Camera failed to load</Text>
          </Alert>
        }
      >
        <Stack gap="md">
          {cameraError && (
            <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
              <Text size="sm">{cameraError}</Text>
            </Alert>
          )}
          <div style={{ position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 8 }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          <Group justify="center">
            <Button
              size="lg"
              onClick={capturePhoto}
              leftSection={<IconCamera />}
              disabled={!stream}
            >
              Capture Photo
            </Button>
          </Group>
        </Stack>
      </ErrorBoundary>
    </Modal>
  );
}

interface AlgoliaVisualSearchProps {
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
}

// Loading skeleton for AlgoliaVisualSearch
function AlgoliaVisualSearchSkeleton({ testId }: { testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Stack gap="xl">
        <div>
          <Group gap="md" mb="md">
            <Skeleton height={64} width={64} radius="md" />
            <div>
              <Skeleton height={32} width={250} mb="xs" />
              <Skeleton height={20} width={350} />
            </div>
          </Group>
        </div>
        <Skeleton height={150} />
        <Skeleton height={200} />
        <Grid>
          {[...Array(4)].map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
              <Skeleton height={350} />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}

// Error state for AlgoliaVisualSearch
function AlgoliaVisualSearchError({ error, testId }: { error: string; testId?: string }) {
  return (
    <Container size="xl" py="xl" data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Visual search failed to load: {error}</Text>
      </Alert>
    </Container>
  );
}

export default function AlgoliaVisualSearch({
  loading = false,
  error,
  'data-testid': testId = 'algolia-visual-search',
}: AlgoliaVisualSearchProps = {}) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [enableColorFilter, setEnableColorFilter] = useState(true);
  const [cameraOpened, { open: openCamera, close: closeCamera }] = useDisclosure(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AlgoliaVisualSearchSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AlgoliaVisualSearchError error={currentError} testId={testId} />;
  }

  // Simulate visual search API call
  const performVisualSearch = useCallback(
    async (imageUrl: string) => {
      try {
        setIsAnalyzing(true);
        setInternalError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Filter results based on similarity threshold
        const filteredResults = mockResults.filter((r) => r.similarity >= similarityThreshold);

        setResults(filteredResults);
        setAnalysis(mockAnalysis);
        setIsAnalyzing(false);
      } catch (error) {
        console.error('Visual search failed:', error);
        setInternalError('Visual search failed. Please try again.');
        setIsAnalyzing(false);
      }
    },
    [similarityThreshold],
  );

  const handleFileUpload = (file: File | null) => {
    try {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imageUrl = e.target?.result as string;
            setUploadedImage(imageUrl);
            performVisualSearch(imageUrl);
          } catch (error) {
            console.error('Failed to process image:', error);
            setInternalError('Failed to process image');
          }
        };
        reader.onerror = () => {
          setInternalError('Failed to read image file');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setInternalError('Failed to upload file');
    }
  };

  const handleCameraCapture = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    performVisualSearch(imageUrl);
  };

  const clearSearch = () => {
    try {
      setUploadedImage(null);
      setResults([]);
      setAnalysis(null);
      setIsAnalyzing(false);
      setInternalError(null);
    } catch (error) {
      console.error('Failed to clear search:', error);
      setInternalError('Failed to clear search');
    }
  };

  return (
    <ErrorBoundary
      fallback={<AlgoliaVisualSearchError error="Visual search failed to render" testId={testId} />}
    >
      <Container size="xl" py="xl" data-testid={testId}>
        <Stack gap="xl">
          {/* Header */}
          <ErrorBoundary fallback={<Skeleton height={80} />}>
            <div>
              <Group gap="md" mb="md">
                <ThemeIcon size="xl" variant="light" color="purple">
                  <IconPhoto />
                </ThemeIcon>
                <div>
                  <Title order={1}>Visual Search</Title>
                  <Text size="lg" c="dimmed">
                    Search by image similarity using AI
                  </Text>
                </div>
              </Group>
            </div>
          </ErrorBoundary>

          {/* Introduction */}
          <ErrorBoundary fallback={<Skeleton height={150} />}>
            <Alert icon={<IconBrandAlgolia />} title="How Visual Search Works" color="purple">
              <Stack gap="xs">
                <Text size="md">
                  Visual search uses computer vision to find products similar to an uploaded image:
                </Text>
                <ul>
                  <li>Upload an image or take a photo with your camera</li>
                  <li>AI analyzes colors, shapes, patterns, and objects</li>
                  <li>Find visually similar products in your catalog</li>
                  <li>Filter by similarity score and visual attributes</li>
                </ul>
              </Stack>
            </Alert>
          </ErrorBoundary>

          {/* Upload interface */}
          <ErrorBoundary fallback={<Skeleton height={200} />}>
            <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
              <Stack gap="md">
                <Title order={3}>Upload or Capture Image</Title>

                {!uploadedImage ? (
                  <Group grow>
                    <FileInput
                      label="Upload Image"
                      placeholder="Choose image file"
                      accept="image/*"
                      leftSection={<IconUpload size={16} />}
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="light"
                      leftSection={<IconCamera />}
                      onClick={() => {
                        try {
                          openCamera();
                        } catch (error) {
                          console.error('Failed to open camera:', error);
                          setInternalError('Failed to open camera');
                        }
                      }}
                      style={{ marginTop: 25 }}
                    >
                      Take Photo
                    </Button>
                  </Group>
                ) : (
                  <Group justify="space-between">
                    <Group>
                      <Image
                        src={uploadedImage}
                        alt="Uploaded image"
                        width={100}
                        height={100}
                        fit="cover"
                        radius="sm"
                      />
                      <div>
                        <Text fw={600}>Image uploaded</Text>
                        <Text size="md" c="dimmed">
                          Analyzing with AI...
                        </Text>
                      </div>
                    </Group>
                    <ActionIcon variant="light" c="red" onClick={clearSearch} size="lg">
                      <IconX />
                    </ActionIcon>
                  </Group>
                )}

                {/* Search settings */}
                {uploadedImage && (
                  <Paper p="md" withBorder={true}>
                    <Stack gap="sm">
                      <Text size="md" fw={600}>
                        Search Settings
                      </Text>

                      <div>
                        <Text size="xs" mb="xs">
                          Similarity Threshold: {Math.round(similarityThreshold * 100)}%
                        </Text>
                        <Slider
                          value={similarityThreshold}
                          onChange={setSimilarityThreshold}
                          min={0.5}
                          max={1}
                          step={0.05}
                          marks={[
                            { value: 0.5, label: '50%' },
                            { value: 0.75, label: '75%' },
                            { value: 1, label: '100%' },
                          ]}
                        />
                      </div>

                      <Switch
                        label="Enable color filtering"
                        checked={enableColorFilter}
                        onChange={(e) => setEnableColorFilter(e.currentTarget.checked)}
                      />
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </Card>
          </ErrorBoundary>

          {/* Analysis and Results */}
          {uploadedImage && (
            <Tabs defaultValue="results">
              <Tabs.List>
                <Tabs.Tab value="results" leftSection={<IconSearch size={16} />}>
                  Search Results ({results.length})
                </Tabs.Tab>
                <Tabs.Tab value="analysis" leftSection={<IconEye size={16} />}>
                  Image Analysis
                </Tabs.Tab>
                <Tabs.Tab value="implementation" leftSection={<IconBrandAlgolia size={16} />}>
                  Implementation
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="results" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
                      <Text size="sm">Results failed to load</Text>
                    </Alert>
                  }
                >
                  {isAnalyzing ? (
                    <Stack gap="md">
                      <Group>
                        <Progress value={100} size="lg" animated style={{ flex: 1 }} />
                        <Text size="md">Analyzing image...</Text>
                      </Group>
                      <Grid>
                        {[...Array(4)].map((_, i) => (
                          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                            <Skeleton height={350} radius="sm" />
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Stack>
                  ) : (
                    <Grid>
                      {results.map((result: any) => (
                        <Grid.Col key={result.objectID} span={{ base: 12, sm: 6, md: 3 }}>
                          <VisualSearchResultCard result={result} />
                        </Grid.Col>
                      ))}
                    </Grid>
                  )}
                </ErrorBoundary>
              </Tabs.Panel>

              <Tabs.Panel value="analysis" pt="xl">
                <ErrorBoundary
                  fallback={
                    <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
                      <Text size="sm">Analysis failed to load</Text>
                    </Alert>
                  }
                >
                  {analysis ? (
                    <ImageAnalysisDisplay analysis={analysis} />
                  ) : isAnalyzing ? (
                    <Skeleton height={400} radius="sm" />
                  ) : null}
                </ErrorBoundary>
              </Tabs.Panel>

              <Tabs.Panel value="implementation" pt="xl">
                <Stack gap="md">
                  <Title order={3}>Implementation Guide</Title>

                  <Code block>
                    {`// 1. Set up visual search index
// Create a separate index for visual search vectors
await client.initIndex('products_visual')
  .setSettings({
    attributesToIndex: ['name', 'brand', 'category'],
    customRanking: ['desc(similarity_score)'],
    attributesForFaceting: ['category', 'brand', 'color']
  });

// 2. Add visual embeddings to products
const productWithVisualData = {
  objectID: 'product-123',
  name: 'Wireless Headphones',
  visual_embedding: [0.1, 0.5, 0.3, ...], // 512-dim vector
  dominant_colors: ['#000000', '#333333'],
  detected_objects: ['headphones', 'electronics'],
  visual_attributes: {
    style: 'modern',
    shape: 'over-ear'
  }
};

// 3. Perform visual search
async function visualSearch(imageFile) {
  // Extract features using computer vision API
  const features = await extractVisualFeatures(imageFile);
  
  // Search for similar items
  const results = await visualIndex.search('', {
    similarQuery: features.embedding,
    filters: 'category: electronics',
    facetFilters: enableColorFilter ? 
      [\`color:\${features.dominant_color}\`] : [],
    hitsPerPage: 20
  };
  
  return results.hits.filter(hit => 
    hit.similarity_score >= ${similarityThreshold}
  );
}

// 4. Client-side implementation
import { createVisualSearch } from '@algolia/visual-search';

const visualSearch = createVisualSearch({
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  indexName: 'products_visual'
});

// Handle file upload
const handleImageUpload = async (file) => {
  const results = await visualSearch.searchByImage(file, {
    similarityThreshold: ${similarityThreshold}),
    maxResults: 20,
    filters: {
      category: 'electronics',
      inStock: true
    }
  };
  
  setSearchResults(results);
};`}
                  </Code>

                  <Alert
                    icon={<IconAdjustments />}
                    title="Visual Search Best Practices"
                    color="blue"
                  >
                    <ul>
                      <li>Use high-quality product images with consistent backgrounds</li>
                      <li>
                        Pre-process images to extract visual features (colors, shapes, textures)
                      </li>
                      <li>Combine visual similarity with text-based filters</li>
                      <li>Implement similarity score thresholds to control result quality</li>
                      <li>
                        Consider different similarity algorithms for different product categories
                      </li>
                    </ul>
                  </Alert>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          )}

          {/* Camera capture modal */}
          <CameraCapture
            opened={cameraOpened}
            onClose={closeCamera}
            onCapture={handleCameraCapture}
          />
        </Stack>
      </Container>
    </ErrorBoundary>
  );
}
