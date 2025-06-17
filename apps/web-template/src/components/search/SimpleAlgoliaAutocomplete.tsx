'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  Group,
  ActionIcon,
  Loader,
  Tooltip,
  Alert,
  Text,
  Skeleton,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import {
  IconSearch,
  IconMicrophone,
  IconMicrophoneOff,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface SimpleAlgoliaAutocompleteProps {
  className?: string;
  placeholder?: string;
  onSelect?: (query: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  visibleFrom?: string;
  locale: string;
  loading?: boolean;
  error?: string;
  'data-testid'?: string;
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
      recognition.onerror = (err: any) => {
        console.error('Voice recognition error:', err);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognition.start();
    },
    [isSupported],
  );

  return { isListening, isSupported, startVoiceSearch };
};

// Loading skeleton for SimpleAlgoliaAutocomplete
function AutocompleteSkeleton({ testId }: { testId: string }) {
  return <Skeleton height={40} radius="sm" data-testid={`${testId}-skeleton`} />;
}

// Error state for SimpleAlgoliaAutocomplete
function AutocompleteError({ error, testId }: { error: string; testId: string }) {
  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      color="red"
      variant="light"
      data-testid={`${testId}-error`}
    >
      <Text size="sm">{error || 'Search is unavailable'}</Text>
    </Alert>
  );
}

export default function SimpleAlgoliaAutocomplete({
  className,
  placeholder = 'Search products...',
  onSelect,
  size = 'md',
  locale,
  loading = false,
  error,
  'data-testid': testId = 'simple-autocomplete',
}: SimpleAlgoliaAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { isListening, isSupported, startVoiceSearch } = useVoiceSearch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      try {
        if (onSelect) {
          onSelect(searchQuery);
        } else {
          router.push(`/${locale}/nextjs-search?q=${encodeURIComponent(searchQuery)}`);
        }
        setInternalError(null);
      } catch (err) {
        console.error('Search navigation error:', err);
        setInternalError('Failed to perform search');
      }
    },
    [onSelect, router, locale],
  );

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    try {
      setQuery(value);
      setIsLoading(false);
      setInternalError(null);
    } catch (err) {
      console.error('Query update error:', err);
      setInternalError('Failed to update search query');
    }
  }, 300);

  const handleVoiceSearch = useCallback(() => {
    try {
      startVoiceSearch((transcript) => {
        setQuery(transcript);
        handleSearch(transcript);
      });
    } catch (err) {
      console.error('Voice search error:', err);
      setInternalError('Voice search failed');
    }
  }, [startVoiceSearch, handleSearch]);

  // Show loading state
  if (!mounted || loading) {
    return <AutocompleteSkeleton testId={testId} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AutocompleteError error={currentError} testId={testId} />;
  }

  return (
    <ErrorBoundary fallback={<AutocompleteError error="Search component failed" testId={testId} />}>
      <TextInput
        className={className}
        placeholder={placeholder}
        value={query}
        onChange={(event: any) => {
          setIsLoading(true);
          debouncedSetQuery(event.currentTarget.value);
        }}
        onKeyDown={(event: any) => {
          try {
            if (event.key === 'Enter' && query) {
              handleSearch(query);
            }
          } catch (err) {
            console.error('Keyboard event error:', err);
            setInternalError('Failed to process search');
          }
        }}
        leftSection={<IconSearch size={16} />}
        rightSection={
          <Group gap={4} wrap="nowrap">
            {isLoading && <Loader size="xs" />}
            {isSupported && (
              <Tooltip label={isListening ? 'Listening...' : 'Voice search'}>
                <ActionIcon
                  variant={isListening ? 'filled' : 'subtle'}
                  color={isListening ? 'red' : 'gray'}
                  onClick={handleVoiceSearch}
                  disabled={isListening}
                  size="md"
                >
                  {isListening ? <IconMicrophoneOff size={14} /> : <IconMicrophone size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        }
        size={size}
        style={{ minWidth: 200 }}
        data-testid={testId}
      />
    </ErrorBoundary>
  );
}
