'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

import { ModalWrapper } from '../../modal-wrapper';
import { OrganizationForm } from '@/components/guests/forms/OrganizationForm';
import { getOrganizationAction } from '@/actions/guests';
import type { Organization } from '@/types/guests';

interface OrganizationModalPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationModalPage({ params }: OrganizationModalPageProps) {
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
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
        loadOrganization();
      }
    }
  }, [paramsData]);

  const loadOrganization = async () => {
    if (!paramsData || paramsData.id === 'new') return;

    setLoading(true);
    try {
      const result = await getOrganizationAction(paramsData.id);
      if (result) {
        const orgData = result as any;
        setOrganization({
          ...orgData,
          createdAt:
            orgData.createdAt instanceof Date ? orgData.createdAt.toISOString() : orgData.createdAt,
        });
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to load organization',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Failed to load organization:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load organization',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.back();
    // Trigger a refresh of the parent data
    window.dispatchEvent(new CustomEvent('refreshOrganizations'));
  };

  // Handle "new" case
  if (paramsData?.id === 'new') {
    return (
      <ModalWrapper title="Create New Organization">
        <OrganizationForm onSuccess={handleSuccess} onCancel={() => router.back()} />
      </ModalWrapper>
    );
  }

  // Handle edit case
  if (loading || !organization) {
    return (
      <ModalWrapper title="Loading...">
        <p>Loading organization details...</p>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title="Edit Organization">
      <OrganizationForm
        organization={organization}
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
      />
    </ModalWrapper>
  );
}
