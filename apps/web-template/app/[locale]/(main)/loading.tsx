import { Skeleton } from '@mantine/core';

export default function MainLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Skeleton height={40} width={120} />
            <div className="flex gap-4">
              <Skeleton height={40} width={40} radius="xl" />
              <Skeleton height={40} width={40} radius="xl" />
              <Skeleton height={40} width={40} radius="xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4">
        <div className="mb-8 space-y-4">
          <Skeleton height={60} width="50%" />
          <Skeleton height={20} width="70%" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton height={200} radius="md" />
              <Skeleton height={20} width="80%" />
              <Skeleton height={16} width="60%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
