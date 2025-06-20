'use client';

import { StarIcon } from '@heroicons/react/24/solid';
import { Carousel } from '@mantine/carousel';
import { Skeleton, Alert, Text, Center, Stack } from '@mantine/core';
import { IconAlertTriangle, IconMessageCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import { type FC, useRef, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import Heading from './shared/Heading/Heading';

export const DEMO_DATA = [
  {
    clientName: 'Tiana Abie',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 1,
  },
  {
    clientName: 'Lennie Swiffan',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 2,
  },
  {
    clientName: 'Berta Emili',
    content:
      'Great quality products, affordable prices, fast and friendly delivery. I very recommend.',
    id: 3,
  },
];

export interface SectionClientSayProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  'data-testid'?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for SectionClientSay
function SectionClientSaySkeleton({ className, testId }: { className?: string; testId?: string }) {
  return (
    <div className={clsx('relative flow-root', className)} data-testid={testId}>
      <div className="text-center mb-12">
        <Skeleton height={40} width="60%" mx="auto" mb="sm" />
        <Skeleton height={20} width="40%" mx="auto" />
      </div>
      <div className="relative mx-auto max-w-2xl md:mb-16">
        <div className="mx-auto w-24 h-24">
          <Skeleton height={96} width={96} circle mx="auto" />
        </div>
        <div className="relative mt-12 lg:mt-16">
          <div className="flex flex-col items-center text-center">
            <Skeleton height={32} width="80%" mb="md" />
            <Skeleton height={24} width="50%" mb="md" />
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={24} width={24} />
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-1 pt-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={8} width={8} circle />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state for SectionClientSay
function SectionClientSayError({
  error: _error,
  className,
  testId,
}: {
  error: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={clsx('relative flow-root', className)} data-testid={testId}>
      <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
        <Text size="sm">Client testimonials failed to load</Text>
      </Alert>
    </div>
  );
}

// Zero state for SectionClientSay
function SectionClientSayEmpty({
  className,
  heading,
  subHeading,
  testId,
}: {
  className?: string;
  heading?: string;
  subHeading?: string;
  testId?: string;
}) {
  return (
    <div className={clsx('relative flow-root', className)} data-testid={testId}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-neutral-900 lg:text-4xl dark:text-neutral-50">
          {heading}
        </h2>
        {subHeading && (
          <span className="mt-2 block text-neutral-600 dark:text-neutral-400">{subHeading}</span>
        )}
      </div>
      <div className="relative mx-auto max-w-2xl md:mb-16">
        <Center py="xl">
          <Stack align="center" gap="md" maw={400}>
            <IconMessageCircle size={48} stroke={1} color="var(--mantine-color-gray-5)" />
            <Text size="lg" fw={600} c="dimmed">
              No testimonials available
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Customer reviews will appear here when available
            </Text>
          </Stack>
        </Center>
      </div>
    </div>
  );
}

const SectionClientSay: FC<SectionClientSayProps> = ({
  className,
  heading = 'Good news from far away 🥇',
  subHeading = "Let's see what people think of Ciseco",
  'data-testid': testId = 'section-client-say',
  loading = false,
  error: _error,
}) => {
  const [internalError, _setInternalError] = useState<string | null>(null);
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const [embla, setEmbla] = useState<any>(null);

  // Show loading state
  if (loading) {
    return <SectionClientSaySkeleton className={className} testId={testId} />;
  }

  // Show error state
  const currentError = _error || internalError;
  if (currentError) {
    return <SectionClientSayError error={currentError} className={className} testId={testId} />;
  }

  // Show zero state when no demo data
  if (!DEMO_DATA || DEMO_DATA.length === 0) {
    return (
      <SectionClientSayEmpty
        className={className}
        heading={heading}
        subHeading={subHeading}
        testId={testId}
      />
    );
  }
  const nextBtnDisabled = !embla?.canScrollNext();
  const prevBtnDisabled = !embla?.canScrollPrev();

  const onNextButtonClick = () => embla?.scrollNext();
  const onPrevButtonClick = () => embla?.scrollPrev();

  return (
    <ErrorBoundary
      fallback={
        <SectionClientSayError
          error="Client testimonials failed to render"
          className={className}
          testId={testId}
        />
      }
    >
      <div className={clsx('relative flow-root', className)} data-testid={testId}>
        <ErrorBoundary fallback={<Skeleton height={80} mx="auto" width="60%" />}>
          <Heading
            description={subHeading}
            isCenter
            nextBtnDisabled={nextBtnDisabled}
            prevBtnDisabled={prevBtnDisabled}
            onClickNext={onNextButtonClick}
            onClickPrev={onPrevButtonClick}
          >
            {heading}
          </Heading>
        </ErrorBoundary>
        <div className="relative mx-auto max-w-2xl md:mb-16">
          {/* MAIN USER IMAGE */}
          <ErrorBoundary fallback={<Skeleton height={96} width={96} circle mx="auto" />}>
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </ErrorBoundary>

          {/* SLIDER */}
          <div className="relative mt-12 lg:mt-16">
            <ErrorBoundary
              fallback={<SectionClientSaySkeleton className={className} testId={testId} />}
            >
              <Carousel
                classNames={{
                  indicator: 'size-2 data-[active]:bg-neutral-700 bg-neutral-300',
                  indicators: 'gap-1 pt-10',
                }}
                getEmblaApi={setEmbla}
                plugins={[autoplay.current]}
                slideSize="100%"
                withControls={false}
                withIndicators
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.reset}
              >
                {DEMO_DATA.map((item) => (
                  <ErrorBoundary key={item.id} fallback={<Skeleton height={200} />}>
                    <Carousel.Slide>
                      <div className="flex flex-col items-center text-center">
                        <span className="block text-2xl">{item.content}</span>
                        <span className="mt-8 block text-2xl font-semibold">{item.clientName}</span>
                        <div className="mt-3.5 flex items-center space-x-0.5 text-yellow-500">
                          <StarIcon className="h-6 w-6" />
                          <StarIcon className="h-6 w-6" />
                          <StarIcon className="h-6 w-6" />
                          <StarIcon className="h-6 w-6" />
                          <StarIcon className="h-6 w-6" />
                        </div>
                      </div>
                    </Carousel.Slide>
                  </ErrorBoundary>
                ))}
              </Carousel>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SectionClientSay;
