import { Skeleton } from '@mantine/core';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton height={40} width={300} className="mx-auto" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton height={250} radius="md" />
            <Skeleton height={20} width="80%" />
            <Skeleton height={16} width="60%" />
            <Skeleton height={24} width="40%" />
          </div>
        ))}
      </div>
    </div>
  );
}
