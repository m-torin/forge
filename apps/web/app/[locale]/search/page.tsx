"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Container,
  Grid,
  GridCol,
  Group,
  Image,
  Paper,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { analytics } from "@repo/analytics";
import {
  Autocomplete,
  SearchBox,
  SearchProvider,
  SearchResults,
  SearchStats,
} from "@repo/design-system/algolia";

// Mock config for demo - replace with real config from environment variables
const mockConfig = {
  apiKey: "6be0576ff61c053d5f9a3225e2a90f76",
  appId: "latency",
  indexName: "instant_search",
};

export default function SearchPage() {
  const [selectedStandalone, setSelectedStandalone] = useState<string>("");
  const [selectedWithProvider, setSelectedWithProvider] = useState<string>("");

  useEffect(() => {
    // Track page view
    analytics.capture("page_viewed", {
      page: "search",
      title: "Algolia Search Demo",
    });
  }, []);

  const handleSearch = (query: string) => {
    // Track search event
    analytics.capture("search_performed", {
      query,
      source: "search_page",
    });
  };

  const handleSelect = (item: any, source: string) => {
    // Track autocomplete selection
    analytics.capture("search_autocomplete_selected", {
      itemId: item.objectID,
      itemTitle: item.title,
      source,
    });
  };

  const _handleResultClick = (hit: any) => {
    // Track search result click
    analytics.capture("search_result_clicked", {
      position: hit.__position,
      resultId: hit.objectID,
      resultTitle: hit.title,
    });
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShellHeader>
        <Group className="h-full px-md">
          <Title order={3}>Algolia Search Demo</Title>
        </Group>
      </AppShellHeader>
      <AppShellMain>
        <Container py="xl" size="xl">
          <Stack gap="xl">
            <div>
              <Title order={1} mb="md" ta="center">
                Algolia React InstantSearch & Autocomplete
              </Title>
              <Text c="dimmed" size="lg" ta="center">
                Powered by React hooks with TypeScript support
              </Text>
            </div>

            <Tabs defaultValue="instantsearch" variant="outline">
              <TabsList grow>
                <TabsTab value="instantsearch">
                  InstantSearch Experience
                </TabsTab>
                <TabsTab value="autocomplete">Autocomplete Comparison</TabsTab>
                <TabsTab value="ecommerce">E-Commerce Example</TabsTab>
              </TabsList>

              {/* InstantSearch Experience */}
              <TabsPanel value="instantsearch">
                <SearchProvider config={mockConfig} routing={true}>
                  <Paper shadow="md" mt="lg" p="xl" radius="md">
                    <Stack gap="md">
                      <Title order={2} ta="center">
                        Full InstantSearch Experience
                      </Title>
                      <Text c="dimmed" ta="center">
                        Search with real-time results, URL routing, and
                        statistics
                      </Text>

                      <SearchBox
                        onSubmit={handleSearch}
                        placeholder="Search for products, brands, categories..."
                      />

                      <SearchStats showQuery={true} showTime={true} />

                      <SearchResults />

                      <Text c="dimmed" size="sm" ta="center">
                        Try searching for: "phone", "laptop", "headphones", or
                        "camera"
                      </Text>
                    </Stack>
                  </Paper>
                </SearchProvider>
              </TabsPanel>

              {/* Autocomplete Comparison */}
              <TabsPanel value="autocomplete">
                <Grid mt="lg">
                  <GridCol span={6}>
                    <Paper shadow="md" p="lg" radius="md">
                      <Stack gap="md">
                        <Title order={3}>Standalone Autocomplete</Title>
                        <Text c="dimmed" size="sm">
                          Works independently without InstantSearch context
                        </Text>

                        <Autocomplete
                          config={mockConfig}
                          maxSuggestions={5}
                          onSelect={(item) => {
                            setSelectedStandalone(item.title);
                            handleSelect(item, "standalone");
                          }}
                          placeholder="Standalone search..."
                        />

                        {selectedStandalone && (
                          <Paper bg="green.1" p="sm" radius="sm">
                            <Text c="green.8" size="sm">
                              ✅ Selected: <strong>{selectedStandalone}</strong>
                            </Text>
                          </Paper>
                        )}

                        <Text c="dimmed" size="xs">
                          Features: Independent, lightweight, custom
                          configuration
                        </Text>
                      </Stack>
                    </Paper>
                  </GridCol>

                  <GridCol span={6}>
                    <SearchProvider config={mockConfig}>
                      <Paper shadow="md" p="lg" radius="md">
                        <Stack gap="md">
                          <Title order={3}>With InstantSearch Provider</Title>
                          <Text c="dimmed" size="sm">
                            Works within InstantSearch context with shared state
                          </Text>

                          <Autocomplete
                            config={mockConfig}
                            maxSuggestions={5}
                            onSelect={(item) => {
                              setSelectedWithProvider(item.title);
                              handleSelect(item, "with_provider");
                            }}
                            placeholder="Search with provider..."
                          />

                          {selectedWithProvider && (
                            <Paper bg="blue.1" p="sm" radius="sm">
                              <Text c="blue.8" size="sm">
                                ✅ Selected:{" "}
                                <strong>{selectedWithProvider}</strong>
                              </Text>
                            </Paper>
                          )}

                          <Text c="dimmed" size="xs">
                            Features: Shared context, state sync, analytics
                            integration
                          </Text>
                        </Stack>
                      </Paper>
                    </SearchProvider>
                  </GridCol>
                </Grid>
              </TabsPanel>

              {/* E-Commerce Example */}
              <TabsPanel value="ecommerce">
                <SearchProvider config={mockConfig} routing={true}>
                  <Paper shadow="md" mt="lg" p="xl" radius="md">
                    <Stack gap="lg">
                      {/* Header */}
                      <Group justify="space-between">
                        <Title order={2}>E-Commerce Search</Title>
                        <Text c="dimmed" size="sm">
                          🛒 Cart (0)
                        </Text>
                      </Group>

                      {/* Search */}
                      <SearchBox placeholder="Search products, brands, categories..." />

                      {/* Stats */}
                      <SearchStats showQuery={true} showTime={true} />

                      {/* Results with Custom Styling */}
                      <SearchResults hitComponent={EcommerceHitComponent} />
                    </Stack>
                  </Paper>
                </SearchProvider>
              </TabsPanel>
            </Tabs>
          </Stack>
        </Container>
      </AppShellMain>
    </AppShell>
  );
}

// Define the component outside of render
function EcommerceHitComponent({ hit }: { hit: any }) {
  return (
    <Paper
      withBorder
      className="hover:shadow-md transition-shadow"
      p="md"
      radius="md"
    >
      <Group>
        {hit.image && (
          <Image
            width={64}
            className="w-16 h-16 rounded-lg object-cover"
            alt={hit.title}
            height={64}
            radius="md"
            src={hit.image}
          />
        )}
        <div className="flex-1">
          <Text fw={600}>{hit.title}</Text>
          {hit.description && (
            <Text c="dimmed" lineClamp={2} size="sm">
              {hit.description}
            </Text>
          )}
          {hit.category && (
            <Text
              style={{
                borderRadius: "0.25rem",
                display: "inline-block",
              }}
              bg="gray.1"
              mt="xs"
              px="xs"
              py={2}
              size="xs"
            >
              {hit.category}
            </Text>
          )}
        </div>
        <div className="text-right">
          {hit.price && (
            <Text c="green.7" fw={700} size="lg">
              ${hit.price}
            </Text>
          )}
          <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </Group>
    </Paper>
  );
}
