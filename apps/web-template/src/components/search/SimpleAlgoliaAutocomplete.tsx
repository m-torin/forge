'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, Group, ActionIcon, Loader, Tooltip } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch, IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';

interface SimpleAlgoliaAutocompleteProps {
  className?: string;
  placeholder?: string;
  onSelect?: (query: string) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  visibleFrom?: string;
  locale: string;
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

export default function SimpleAlgoliaAutocomplete({
  className,
  placeholder = 'Search products...',
  onSelect,
  size = 'md',
  locale,
}: SimpleAlgoliaAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, isSupported, startVoiceSearch } = useVoiceSearch();
  const router = useRouter();

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (onSelect) {
        onSelect(searchQuery);
      } else {
        router.push(`/${locale}/nextjs-search?q=${encodeURIComponent(searchQuery)}`);
      }
    },
    [onSelect, router, locale],
  );

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setQuery(value);
    setIsLoading(false);
  }, 300);

  const handleVoiceSearch = useCallback(() => {
    startVoiceSearch((transcript) => {
      setQuery(transcript);
      handleSearch(transcript);
    });
  }, [startVoiceSearch, handleSearch]);

  return (
    <TextInput
      className={className}
      placeholder={placeholder}
      value={query}
      onChange={(event: any) => {
        setIsLoading(true);
        debouncedSetQuery(event.currentTarget.value);
      }}
      onKeyDown={(event: any) => {
        if (event.key === 'Enter' && query) {
          handleSearch(query);
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
    />
  );
}
