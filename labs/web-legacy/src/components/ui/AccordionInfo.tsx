'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Accordion, Skeleton, Alert, Text } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import React, { type FC, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

const DEMO_DATA = [
  {
    content:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    name: 'Description',
  },
  {
    content: `<ul class="list-disc list-inside leading-7">
    <li>Made from a sheer Belgian power micromesh.</li>
    <li>
    74% Polyamide (Nylon) 26% Elastane (Spandex)
    </li>
    <li>
    Adjustable hook & eye closure and straps
    </li>
    <li>
    Hand wash in cold water, dry flat
    </li>
  </ul>`,
    name: 'Fabric + Care',
  },

  {
    content:
      "Use this as a guide. Preference is a huge factor — if you're near the top of a size range and/or prefer more coverage, you may want to size up.",
    name: 'How it Fits',
  },
  {
    content: `
    <ul class="list-disc list-inside leading-7">
    <li>All full-priced, unworn items, with tags attached and in their original packaging are eligible for return or exchange within 30 days of placing your order.</li>
    <li>
    Please note, packs must be returned in full. We do not accept partial returns of packs.
    </li>
    <li>
    Want to know our full returns policies? Here you go.
    </li>
    <li>
    Want more info about shipping, materials or care instructions? Here!
    </li>
  </ul>
    `,
    name: 'FAQ',
  },
];

// Loading skeleton for AccordionInfo
function AccordionInfoSkeleton({ panelClassName }: { panelClassName?: string }) {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={44} radius="lg" />
          <div className={panelClassName}>
            <Skeleton height={16} radius="sm" mb="xs" />
            <Skeleton height={16} radius="sm" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Error state for AccordionInfo
function AccordionInfoError({
  error,
  panelClassName: _panelClassName,
}: {
  error: string;
  panelClassName?: string;
}) {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Accordion information failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for AccordionInfo
function AccordionInfoEmpty({ panelClassName: _panelClassName }: { panelClassName?: string }) {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-neutral-50 rounded-lg dark:bg-neutral-800">
        <IconInfoCircle size={32} stroke={1} color="var(--mantine-color-gray-5)" />
        <Text size="sm" c="dimmed" mt="sm">
          No information available
        </Text>
      </div>
    </div>
  );
}

interface Props {
  data?: typeof DEMO_DATA;
  panelClassName?: string;
  loading?: boolean;
  error?: string;
}

const AccordionInfo: FC<Props> = ({
  data = DEMO_DATA,
  panelClassName = 'p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6',
  loading = false,
  error,
}) => {
  const [internalError, _setInternalError] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return <AccordionInfoSkeleton panelClassName={panelClassName} />;
  }

  // Show error state
  const currentError = error || internalError;
  if (currentError) {
    return <AccordionInfoError error={currentError} panelClassName={panelClassName} />;
  }

  // Show zero state when no data
  if (!data || data.length === 0) {
    return <AccordionInfoEmpty panelClassName={panelClassName} />;
  }
  const defaultValue = data.slice(0, 2).map((_, index) => String(index));

  return (
    <ErrorBoundary
      fallback={
        <AccordionInfoError error="Accordion failed to render" panelClassName={panelClassName} />
      }
    >
      <Accordion
        chevron={<PlusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />}
        classNames={{
          chevron: 'ml-auto',
          content: panelClassName,
          control:
            'flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-neutral-500/75 dark:bg-neutral-800 dark:hover:bg-neutral-700',
          item: 'border-0',
          root: 'w-full space-y-2.5 rounded-2xl',
        }}
        defaultValue={defaultValue}
        multiple
      >
        {data.map((item, index) => (
          <ErrorBoundary key={item.name} fallback={<Skeleton height={44} radius="lg" />}>
            <Accordion.Item value={String(index)}>
              <Accordion.Control>{item.name}</Accordion.Control>
              <Accordion.Panel>
                <ErrorBoundary
                  fallback={
                    <Text c="red" size="sm">
                      Content failed to load
                    </Text>
                  }
                >
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                </ErrorBoundary>
              </Accordion.Panel>
            </Accordion.Item>
          </ErrorBoundary>
        ))}
      </Accordion>
    </ErrorBoundary>
  );
};

export default AccordionInfo;
