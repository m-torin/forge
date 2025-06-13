import { Skeleton } from '@mantine/core';

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters skeleton */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <Skeleton height={40} width={120} radius="md" />
          <Skeleton height={40} width={120} radius="md" />
          <Skeleton height={40} width={120} radius="md" />
        </div>
        <Skeleton height={40} width={200} radius="md" />
      </div>
      
      {/* Products grid skeleton */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="group">
            <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <Skeleton height={300} />
              {/* Quick view button skeleton */}
              <div className="absolute bottom-4 right-4">
                <Skeleton height={40} width={40} radius="xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton height={16} width="30%" />
              <Skeleton height={20} width="80%" />
              <div className="flex items-center gap-2">
                <Skeleton height={24} width={80} />
                <Skeleton height={16} width={60} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}