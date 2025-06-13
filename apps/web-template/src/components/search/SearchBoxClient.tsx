'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TextInput, ActionIcon, Group, Paper, Tooltip, Loader } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch, IconMicrophone, IconMicrophoneOff } from '@tabler/icons-react';
import { useSearchBox } from 'react-instantsearch';

interface SearchBoxClientProps {
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

export function SearchBoxClient({ locale }: SearchBoxClientProps) {
  const { query, refine } = useSearchBox();
  const { isListening, isSupported, startVoiceSearch } = useVoiceSearch();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounced search
  const debouncedSearch = useDebouncedCallback((searchQuery: string) => {
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
  }, 300);

  const handleVoiceSearch = useCallback(() => {
    startVoiceSearch((transcript) => {
      debouncedSearch(transcript);
    });
  }, [startVoiceSearch, debouncedSearch]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    debouncedSearch(event.currentTarget.value);
  };

  return (
    <Paper shadow="sm" radius="sm" p="md">
      <Group gap="md" wrap="nowrap">
        <TextInput
          placeholder="Search products..."
          value={query}
          onChange={handleChange}
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
                  >
                    {isListening ? <IconMicrophoneOff size={16} /> : <IconMicrophone size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          }
          radius="sm"
          size="lg"
          style={{ flex: 1 }}
        />
      </Group>
    </Paper>
  );
}
