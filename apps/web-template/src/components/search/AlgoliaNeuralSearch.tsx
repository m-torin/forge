'use client';

import React, { useState } from 'react';
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
  TextInput,
  Paper,
  Code,
  Alert,
  ThemeIcon,
  Progress,
  Slider,
  Switch,
  Tabs,
  Highlight,
  Timeline,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBrain,
  IconSearch,
  IconBrandAlgolia,
  IconSparkles,
  IconTarget,
  IconMoodSmile,
  IconMoodSad,
  IconLanguage,
  IconRobot,
  IconMicrophone,
  IconCode,
  IconInfoCircle,
  IconTrendingUp,
  IconFilter,
} from '@tabler/icons-react';

// Types for Neural Search
interface NeuralSearchResult {
  objectID: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  semanticScore: number;
  keywordScore: number;
  hybridScore: number;
  relevantConcepts: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  intent?: string;
}

interface SearchIntent {
  primary: string;
  confidence: number;
  entities: { type: string; value: string; confidence: number }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  semanticConcepts: string[];
}

// Mock neural search results
const mockNeuralResults: NeuralSearchResult[] = [
  {
    objectID: 'neural-1',
    name: 'Comfortable Ergonomic Office Chair',
    description:
      'Designed for long work sessions with lumbar support and breathable mesh. Perfect for productivity and comfort during extended periods of use.',
    category: 'Office Furniture',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
    semanticScore: 0.94,
    keywordScore: 0.45,
    hybridScore: 0.89,
    relevantConcepts: ['comfort', 'ergonomics', 'productivity', 'health', 'workplace'],
    sentiment: 'positive',
    intent: 'product_search',
  },
  {
    objectID: 'neural-2',
    name: 'Wellness Meditation Cushion Set',
    description:
      'Premium meditation cushions designed for mindfulness practice and stress relief. Made with organic materials for ultimate comfort.',
    category: 'Wellness',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop',
    semanticScore: 0.88,
    keywordScore: 0.32,
    hybridScore: 0.84,
    relevantConcepts: ['relaxation', 'mindfulness', 'wellness', 'comfort', 'peace'],
    sentiment: 'positive',
    intent: 'lifestyle_search',
  },
  {
    objectID: 'neural-3',
    name: 'Standing Desk Converter',
    description:
      'Transform your workspace for better health. Adjustable height standing desk converter that promotes better posture and reduces back pain.',
    category: 'Office Equipment',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop',
    semanticScore: 0.86,
    keywordScore: 0.67,
    hybridScore: 0.82,
    relevantConcepts: ['health', 'posture', 'workplace', 'flexibility', 'productivity'],
    sentiment: 'positive',
    intent: 'health_focused',
  },
  {
    objectID: 'neural-4',
    name: 'Blue Light Blocking Glasses',
    description:
      'Protect your eyes from digital strain with these stylish blue light filtering glasses. Reduces eye fatigue from computer screens.',
    category: 'Health & Wellness',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop',
    semanticScore: 0.82,
    keywordScore: 0.58,
    hybridScore: 0.78,
    relevantConcepts: ['eye health', 'digital wellness', 'protection', 'technology', 'comfort'],
    sentiment: 'positive',
    intent: 'health_protection',
  },
];

// Mock intent analysis
const mockIntentAnalysis: SearchIntent = {
  primary: 'seeking_comfort_solutions',
  confidence: 0.87,
  entities: [
    { type: 'condition', value: 'back pain', confidence: 0.92 },
    { type: 'activity', value: 'work', confidence: 0.84 },
    { type: 'duration', value: 'long hours', confidence: 0.78 },
  ],
  sentiment: 'negative',
  semanticConcepts: ['discomfort', 'relief', 'ergonomics', 'health', 'workplace', 'solutions'],
};

// Neural search explanation
const neuralSearchSteps = [
  {
    title: 'Query Understanding',
    description: 'AI analyzes the natural language query to understand intent and context',
    icon: IconBrain,
    color: 'blue',
  },
  {
    title: 'Semantic Embedding',
    description: 'Convert text to high-dimensional vectors that capture meaning',
    icon: IconSparkles,
    color: 'purple',
  },
  {
    title: 'Vector Similarity',
    description: 'Find products with similar semantic meaning, not just keywords',
    icon: IconTarget,
    color: 'green',
  },
  {
    title: 'Hybrid Ranking',
    description: 'Combine semantic relevance with traditional keyword matching',
    icon: IconTrendingUp,
    color: 'orange',
  },
];

// Search result card with neural insights
function NeuralSearchResultCard({ result }: { result: NeuralSearchResult }) {
  const [showDetails, setShowDetails] = useState(false);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <IconMoodSmile size={14} color="green" />;
      case 'negative':
        return <IconMoodSad size={14} color="red" />;
      default:
        return <IconMoodSmile size={14} color="gray" />;
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h="100%">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Text fw={600} size="md" lineClamp={2}>
              {result.name}
            </Text>
            <Badge color="blue" size="xs" mt="xs">
              {result.category}
            </Badge>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="xs" color="dimmed">
              Hybrid Score
            </Text>
            <Badge color="green" variant="light">
              {Math.round(result.hybridScore * 100)}%
            </Badge>
          </div>
        </Group>

        <Text size="xs" color="dimmed" lineClamp={3}>
          {result.description}
        </Text>

        <Group gap="xs">
          <Text size="xs" color="dimmed">
            Semantic:
          </Text>
          <Progress
            value={result.semanticScore * 100}
            size="xs"
            color="purple"
            style={{ flex: 1 }}
          />
          <Text size="xs">{Math.round(result.semanticScore * 100)}%</Text>
        </Group>

        <Group gap="xs">
          <Text size="xs" color="dimmed">
            Keyword:
          </Text>
          <Progress value={result.keywordScore * 100} size="xs" color="blue" style={{ flex: 1 }} />
          <Text size="xs">{Math.round(result.keywordScore * 100)}%</Text>
        </Group>

        <Paper p="xs" withBorder={true} radius="sm">
          <Group gap="xs" mb="xs">
            <Text size="xs" fw={600}>
              Relevant Concepts:
            </Text>
            {result.sentiment && getSentimentIcon(result.sentiment)}
          </Group>
          <Group gap={4}>
            {result.relevantConcepts.slice(0, 3).map((concept) => (
              <Badge key={concept} size="xs" variant="dot" color="blue">
                {concept}
              </Badge>
            ))}
          </Group>
        </Paper>

        <Group justify="space-between" ta="center">
          <Text fw={700} size="lg" color="green">
            ${result.price}
          </Text>
          <Tooltip label="View AI insights">
            <ActionIcon variant="light" onClick={() => setShowDetails(!showDetails)}>
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {showDetails && (
          <Paper p="xs" withBorder={true}>
            <Stack gap="xs">
              <Text size="xs" fw={600}>
                AI Analysis:
              </Text>
              <Text size="xs">Intent: {result.intent}</Text>
              <Text size="xs">All concepts: {result.relevantConcepts.join(', ')}</Text>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Card>
  );
}

// Intent analysis display
function IntentAnalysis({ intent }: { intent: SearchIntent }) {
  return (
    <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
      <Stack gap="md">
        <Group>
          <ThemeIcon size="lg" variant="light" color="purple">
            <IconRobot />
          </ThemeIcon>
          <div>
            <Title order={4}>Query Intent Analysis</Title>
            <Text size="md" color="dimmed">
              AI understanding of your search
            </Text>
          </div>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder={true}>
              <Text size="xs" color="dimmed">
                Primary Intent
              </Text>
              <Text fw={600}>{intent.primary.replace(/_/g, ' ')}</Text>
              <Progress value={intent.confidence * 100} size="xs" mt="xs" />
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder={true}>
              <Text size="xs" color="dimmed">
                Sentiment
              </Text>
              <Group gap="xs">
                <Text fw={600}>{intent.sentiment}</Text>
                {intent.sentiment === 'positive' && <IconMoodSmile size={16} color="green" />}
                {intent.sentiment === 'negative' && <IconMoodSad size={16} color="red" />}
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <div>
          <Text size="md" fw={600} mb="xs">
            Extracted Entities
          </Text>
          <Stack gap="xs">
            {intent.entities.map((entity, i) => (
              <Group key={i} justify="space-between">
                <Group gap="xs">
                  <Badge variant="light" color="blue">
                    {entity.type}
                  </Badge>
                  <Text size="md">{entity.value}</Text>
                </Group>
                <Badge size="md" color="gray">
                  {Math.round(entity.confidence * 100)}%
                </Badge>
              </Group>
            ))}
          </Stack>
        </div>

        <div>
          <Text size="md" fw={600} mb="xs">
            Semantic Concepts
          </Text>
          <Group gap="xs">
            {intent.semanticConcepts.map((concept) => (
              <Badge key={concept} variant="dot" color="purple">
                {concept}
              </Badge>
            ))}
          </Group>
        </div>
      </Stack>
    </Card>
  );
}

export default function AlgoliaNeuralSearch() {
  const [query, setQuery] = useState(
    'I need something to help with back pain from sitting all day',
  );
  const [results, setResults] = useState<NeuralSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [intentAnalysis, setIntentAnalysis] = useState<SearchIntent | null>(null);
  const [semanticWeight, setSemanticWeight] = useState(0.7);
  const [enableIntent, setEnableIntent] = useState(true);
  const [enableSentiment, setEnableSentiment] = useState(true);

  const performNeuralSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Adjust results based on semantic weight
    const adjustedResults = mockNeuralResults
      .map((result: any) => ({
        ...result,
        hybridScore:
          result.semanticScore * semanticWeight + result.keywordScore * (1 - semanticWeight),
      }))
      .sort((a, b) => b.hybridScore - a.hybridScore);

    setResults(adjustedResults);
    if (enableIntent) {
      setIntentAnalysis(mockIntentAnalysis);
    }
    setIsSearching(false);
  };

  const exampleQueries = [
    'I need something to help with back pain from sitting all day',
    'Looking for ways to be more productive while working from home',
    'Want to reduce stress and anxiety naturally',
    'Need better focus during long work sessions',
    'Seeking eco-friendly alternatives for daily use',
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" variant="light" color="purple">
              <IconBrain />
            </ThemeIcon>
            <div>
              <Title order={1}>Neural Search</Title>
              <Text size="lg" color="dimmed">
                AI-powered semantic search that understands meaning and intent
              </Text>
            </div>
          </Group>
        </div>

        {/* Introduction */}
        <Alert icon={<IconBrandAlgolia />} title="What is Neural Search?" color="purple">
          <Stack gap="xs">
            <Text size="md">
              Neural Search uses machine learning to understand the meaning behind queries:
            </Text>
            <ul>
              <li>Understands natural language and intent, not just keywords</li>
              <li>Finds semantically similar products using vector embeddings</li>
              <li>Combines semantic understanding with traditional keyword matching</li>
              <li>Analyzes sentiment and context for better relevance</li>
            </ul>
          </Stack>
        </Alert>

        {/* How it works */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Title order={3} mb="md">
            How Neural Search Works
          </Title>
          <Timeline>
            {neuralSearchSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Timeline.Item
                  key={i}
                  bullet={
                    <ThemeIcon size="md" variant="light" color={step.color}>
                      <Icon size={16} />
                    </ThemeIcon>
                  }
                  title={step.title}
                >
                  <Text size="md" color="dimmed">
                    {step.description}
                  </Text>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Card>

        {/* Search interface */}
        <Card shadow="sm" padding="lg" radius="sm" withBorder={true}>
          <Stack gap="md">
            <Title order={3}>Try Neural Search</Title>

            <Group align="flex-end">
              <TextInput
                label="Natural Language Query"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder="Describe what you're looking for in natural language..."
                style={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && performNeuralSearch()}
              />
              <Button
                leftSection={<IconSearch />}
                onClick={performNeuralSearch}
                loading={isSearching}
              >
                Search
              </Button>
            </Group>

            {/* Example queries */}
            <div>
              <Text size="md" fw={600} mb="xs">
                Try these examples:
              </Text>
              <Group gap="xs">
                {exampleQueries.map((example) => (
                  <Button key={example} size="xs" variant="light" onClick={() => setQuery(example)}>
                    {example.substring(0, 30)}...
                  </Button>
                ))}
              </Group>
            </div>

            {/* Search settings */}
            <Paper p="md" withBorder={true}>
              <Stack gap="sm">
                <Text size="md" fw={600}>
                  Neural Search Settings
                </Text>

                <div>
                  <Text size="xs" mb="xs">
                    Semantic vs Keyword Weight: {Math.round(semanticWeight * 100)}% semantic
                  </Text>
                  <Slider
                    value={semanticWeight}
                    onChange={setSemanticWeight}
                    min={0}
                    max={1}
                    step={0.1}
                    marks={[
                      { value: 0, label: 'Keywords' },
                      { value: 0.5, label: 'Hybrid' },
                      { value: 1, label: 'Semantic' },
                    ]}
                  />
                </div>

                <Group>
                  <Switch
                    label="Intent Analysis"
                    checked={enableIntent}
                    onChange={(e) => setEnableIntent(e.currentTarget.checked)}
                  />
                  <Switch
                    label="Sentiment Analysis"
                    checked={enableSentiment}
                    onChange={(e) => setEnableSentiment(e.currentTarget.checked)}
                  />
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Card>

        {/* Results */}
        {(results.length > 0 || isSearching) && (
          <Tabs defaultValue="results">
            <Tabs.List>
              <Tabs.Tab value="results" leftSection={<IconSearch size={16} />}>
                Search Results ({results.length})
              </Tabs.Tab>
              {intentAnalysis && (
                <Tabs.Tab value="intent" leftSection={<IconBrain size={16} />}>
                  Intent Analysis
                </Tabs.Tab>
              )}
              <Tabs.Tab value="implementation" leftSection={<IconCode size={16} />}>
                Implementation
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="results" pt="xl">
              {isSearching ? (
                <Stack gap="md">
                  <Group>
                    <Progress value={100} size="lg" animated style={{ flex: 1 }} />
                    <Text size="md">Processing with AI...</Text>
                  </Group>
                  <Grid>
                    {[...Array(4)].map((_, i) => (
                      <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                        <Card shadow="sm" padding="lg" radius="sm" withBorder={true} h={300}>
                          <Stack gap="sm">
                            {[...Array(6)].map((_, j) => (
                              <div key={j}>
                                <div
                                  style={{
                                    height: j === 0 ? 20 : 10,
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: 4,
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                  }}
                                />
                              </div>
                            ))}
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              ) : (
                <Grid>
                  {results.map((result: any) => (
                    <Grid.Col key={result.objectID} span={{ base: 12, sm: 6, md: 3 }}>
                      <NeuralSearchResultCard result={result} />
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="intent" pt="xl">
              {intentAnalysis && <IntentAnalysis intent={intentAnalysis} />}
            </Tabs.Panel>

            <Tabs.Panel value="implementation" pt="xl">
              <Stack gap="md">
                <Title order={3}>Implementation Guide</Title>

                <Code block>
                  {`// 1. Enable NeuralSearch in your index
await index.setSettings({
  attributesToIndex: ['name', 'description', 'category'],
    // Enable vector search
  advancedSyntax: true,
  // Configure hybrid search
  semanticSearch: {
    enabled: true,
    embedModel: 'text-embedding-ada-002',
  },
  customRanking: ['desc(popularity)', 'desc(rating)']
};

// 2. Index products with embeddings
const productWithEmbedding = {
  objectID: 'product-123',
  name: 'Ergonomic Office Chair',
  description: 'Comfortable chair for back pain relief...',
  // Vector embedding (automatically generated)
  _vector: await generateEmbedding(description),
  semantic_categories: ['comfort', 'health', 'office'],
};

await index.saveObject(productWithEmbedding);

// 3. Perform neural search
const neuralSearchResults = await index.search('${query}', {
  // Hybrid search parameters
  semanticSearch: {
    enabled: true,
    // Weight between semantic (0-1) and keyword matching
    hybridWeight: ${semanticWeight},
  },
  // Enable intent analysis
  enableABTest: false,
  analyticsTags: ['neural-search'],
  // Additional filters
  filters: 'availability:true'
};

// 4. Extract intent and entities
const intentAnalysis = await analyzeIntent('${query}');
console.log('Intent:', intentAnalysis.primary);
console.log('Entities:', intentAnalysis.entities);
console.log('Sentiment:', intentAnalysis.sentiment);

// 5. Client-side React component
import { useNeuralSearch } from '@algolia/react-instantsearch';

function NeuralSearchComponent() {
  const { search, results, isSearching } = useNeuralSearch({
    indexName: 'products',
    semanticWeight: ${semanticWeight},
    enableIntent: ${enableIntent},
  });

  return (
    <div>
      <input 
        type="text"
        onChange={(e) => search(e.target.value)}
        placeholder="Natural language search..."
      />
      {results.map(hit => (
        <ProductCard 
          key={hit.objectID}
          product={hit}
          semanticScore={hit._semanticScore}
          keywordScore={hit._keywordScore}
        />
      ))}
    </div>
  );
}`}
                </Code>

                <Alert icon={<IconSparkles />} title="Neural Search Benefits" color="green">
                  <ul>
                    <li>
                      <strong>Better intent understanding:</strong> Finds products based on user
                      needs, not just keywords
                    </li>
                    <li>
                      <strong>Semantic similarity:</strong> Discovers related products through
                      meaning, not text matching
                    </li>
                    <li>
                      <strong>Natural language queries: </strong> Users can search like they speak
                    </li>
                    <li>
                      <strong>Contextual relevance:</strong> Considers sentiment and context for
                      better results
                    </li>
                    <li>
                      <strong>Cross-lingual support:</strong> Works across different languages
                    </li>
                  </ul>
                </Alert>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>
    </Container>
  );
}
