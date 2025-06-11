"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface SearchPageUiProps {
  initialQuery?: string;
  translations: {
    placeholder: string;
    button: string;
    results: string;
    noResults: string;
    tryAgain: string;
  };
}

export default function SearchPageUi({ initialQuery = "", translations }: SearchPageUiProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    // Mock search results
    if (searchQuery.trim()) {
      setResults([
        `Result 1 for "${searchQuery}"`,
        `Result 2 for "${searchQuery}"`,
        `Result 3 for "${searchQuery}"`,
      ]);
    } else {
      setResults([]);
    }
  };

  return (
    <Paper p="md" shadow="xs" radius="md">
      <Stack gap="md">
        <Group>
          <TextInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={translations.placeholder}
            leftSection={<IconSearch size={20} />}
            style={{ flex: 1 }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} variant="filled">
            {translations.button}
          </Button>
        </Group>

        {hasSearched && results.length > 0 && (
          <Stack gap="sm" mt="md">
            <Title order={3}>{translations.results}</Title>
            {results.map((result, index) => (
              <Paper key={index} p="sm" withBorder>
                <Text>{result}</Text>
              </Paper>
            ))}
          </Stack>
        )}

        {hasSearched && searchQuery && results.length === 0 && (
          <Stack gap="sm" mt="md" align="center">
            <Text size="lg" c="dimmed">
              {translations.noResults}
            </Text>
            <Text size="sm" c="dimmed">
              {translations.tryAgain}
            </Text>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}