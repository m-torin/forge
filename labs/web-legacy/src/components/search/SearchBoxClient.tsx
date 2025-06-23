'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  ActionIcon,
  Group,
  Paper,
  Tooltip,
  Loader,
  Skeleton,
  Alert,
  Text,
  Stack,
  Center,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import {
  IconSearch,
  IconMicrophone,
  IconMicrophoneOff,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useSearchBox } from 'react-instantsearch';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface SearchBoxClientProps {
  locale: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SearchBox
function SearchBoxSkeleton() {
  return (
    <Paper shadow="sm" radius="sm" p="md">
      <Group gap="md" wrap="nowrap">
        <Skeleton height={40} style={{ flex: 1 }} radius="sm" />
      </Group>
    </Paper>
  );
}

// Error state for SearchBox
function SearchBoxError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <Paper shadow="sm" radius="sm" p="md" style={{ borderColor: 'red', borderWidth: 1 }}>
      <Center>
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Stack gap="xs">
            <Text size="xs">Search unavailable</Text>
            {onRetry && (
              <button onClick={onRetry} className="text-xs underline">
                Try Again
              </button>
            )}
          </Stack>
        </Alert>
      </Center>
    </Paper>
  );
}

// Voice search hook
const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  React.useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startVoiceSearch = useCallback(
    (onResult: (transcript: string) => void) => {
      if (!isSupported) return;

      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    },
    [isSupported],
  );

  return { isListening, isSupported, startVoiceSearch };
};

export function SearchBoxClient({ locale, loading = false, error }: SearchBoxClientProps) {
  const { query, refine } = useSearchBox();
  const { isListening, isSupported, startVoiceSearch } = useVoiceSearch();
  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const router = useRouter();

  // Show loading state
  if (loading) {
    return <SearchBoxSkeleton />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <SearchBoxError error={currentError} onRetry={() => setInternalError(null)} />;
  }

  // Debounced search
  const debouncedSearch = useDebouncedCallback((searchQuery: string) => {
    try {
      refine(searchQuery);

      // Update URL with search query
      const url = new URL(window.location.href);
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }

      router.replace(url.pathname + url.search, { scroll: false });
      setIsLoading(false);
    } catch (_error) {
      console.error('Search error:', _error);
      setInternalError('Search failed');
      setIsLoading(false);
    }
  }, 300);

  const handleVoiceSearch = useCallback(() => {
    try {
      startVoiceSearch((transcript) => {
        debouncedSearch(transcript);
      });
    } catch (_error) {
      console.error('Voice search error:', _error);
      setInternalError('Voice search failed');
    }
  }, [startVoiceSearch, debouncedSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      debouncedSearch(event.currentTarget.value);
    } catch (_error) {
      console.error('Search input error:', _error);
      setInternalError('Search input failed');
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary fallback={<SearchBoxError error="Search box failed to render" />}>
      <Paper shadow="sm" radius="sm" p="md">
        <Group gap="md" wrap="nowrap">
          <ErrorBoundary fallback={<Skeleton height={40} style={{ flex: 1 }} radius="sm" />}>
            <TextInput
              placeholder="Search products..."
              value={query}
              onChange={handleChange}
              leftSection={<IconSearch size={16} />}
              rightSection={
                <Group gap={4} wrap="nowrap">
                  {isLoading && <Loader size="xs" />}
                  {isSupported && (
                    <ErrorBoundary fallback={<Skeleton height={24} width={24} />}>
                      <Tooltip label={isListening ? 'Listening...' : 'Voice search'}>
                        <ActionIcon
                          variant={isListening ? 'filled' : 'subtle'}
                          color={isListening ? 'red' : 'gray'}
                          onClick={handleVoiceSearch}
                          disabled={isListening}
                        >
                          {isListening ? (
                            <IconMicrophoneOff size={16} />
                          ) : (
                            <IconMicrophone size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    </ErrorBoundary>
                  )}
                </Group>
              }
              radius="sm"
              size="lg"
              style={{ flex: 1 }}
            />
          </ErrorBoundary>
        </Group>
      </Paper>
    </ErrorBoundary>
  );
}
