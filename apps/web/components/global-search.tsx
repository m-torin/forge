"use client";

import { Badge, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { analytics } from "@repo/analytics";
import { Autocomplete } from "@repo/design-system/algolia";

// Mock Algolia configuration - replace with real config
const searchConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ||
    "6be0576ff61c053d5f9a3225e2a90f76",
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "latency",
  indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "instant_search",
};

export function GlobalSearch() {
  const [opened, { close, open }] = useDisclosure(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Open search with Cmd/Ctrl + K
  useHotkeys([["mod+K", () => open()]]);

  const _handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    // Track search event
    analytics.capture("global_search_performed", {
      query: searchQuery,
      source: "header",
    });
  };

  const handleSelect = (item: any) => {
    // Track selection
    analytics.capture("global_search_result_selected", {
      itemId: item.objectID,
      itemTitle: item.title,
      query,
    });

    // Navigate based on item type
    if (item.type === "product") {
      router.push(`/products/${item.objectID}` as any);
    } else if (item.type === "user") {
      router.push(`/users/${item.objectID}` as any);
    } else if (item.type === "page") {
      router.push((item.url || "/") as any);
    } else {
      router.push(`/search?q=${encodeURIComponent(item.title)}` as any);
    }

    close();
  };

  return (
    <>
      <Group
        component="button"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        role="button"
        style={{
          minWidth: "200px",
          width: "auto",
          background: "transparent",
          border: "1px solid var(--mantine-color-gray-3)",
          borderRadius: "var(--mantine-radius-sm)",
          cursor: "pointer",
          padding: "0.5rem 1rem",
        }}
        aria-label="Open search"
        gap="xs"
        tabIndex={0}
      >
        <IconSearch size={16} />
        <Text c="dimmed" size="sm">
          Search...
        </Text>
        <Badge size="xs" variant="light">
          ⌘K
        </Badge>
      </Group>

      <Modal
        onClose={close}
        opened={opened}
        styles={{
          body: { padding: 0 },
          header: { padding: "1rem" },
        }}
        padding={0}
        size="lg"
        title="Search"
      >
        <Stack p="md" pt={0}>
          <Autocomplete
            config={searchConfig}
            maxSuggestions={8}
            onSelect={handleSelect}
            placeholder="Search products, users, pages..."
          />

          <Text c="dimmed" size="xs" ta="center">
            Press <strong>Enter</strong> to search, <strong>↑↓</strong> to
            navigate
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
