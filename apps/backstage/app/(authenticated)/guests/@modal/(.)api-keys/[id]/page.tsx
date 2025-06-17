'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

import { ModalWrapper } from '../../modal-wrapper';
import { ApiKeyForm } from '../../../components/forms/ApiKeyForm';
import { getApiKey } from '@repo/auth/server/next';
import type { ApiKey } from '../../../types';

interface ApiKeyModalPageProps {
  params: Promise<{ id: string }>;
}

export default function ApiKeyModalPage({ params }: ApiKeyModalPageProps) {
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then((p) => setParamsData(p));
  }, [params]);

  useEffect(() => {
    if (paramsData) {
      if (paramsData.id === 'new') {
        setLoading(false);
      } else {
        loadApiKey();
      }
    }
  }, [paramsData]);

  const loadApiKey = async () => {
    if (!paramsData || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getApiKey(paramsData.id);
      if (result.success && result.data) {
        setApiKey(result.data as ApiKey);
      } else {
        notifications.show({
          title: 'Error',
          message: result.error || 'Failed to load API key',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load API key',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.back();
    // Trigger a refresh of the parent data
    window.dispatchEvent(new CustomEvent('refreshApiKeys'));
  };

  // Handle "new" case
  if (paramsData?.id === 'new') {
    return (
      <ModalWrapper title="Create New API Key">
        <ApiKeyForm onSuccess={handleSuccess} onCancel={() => router.back()} />
      </ModalWrapper>
    );
  }

  // Handle edit case
  if (loading || !apiKey) {
    return (
      <ModalWrapper title="Loading...">
        <p>Loading API key details...</p>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title="Edit API Key">
      <ApiKeyForm apiKey={apiKey} onSuccess={handleSuccess} onCancel={() => router.back()} />
    </ModalWrapper>
  );
}
