import { Skeleton } from '@mantine/core';

export default function CollectionsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section skeleton */}
      <div className="mb-12 text-center">
        <Skeleton height={48} width={400} className="mx-auto mb-4" />
        <Skeleton height={20} width={600} className="mx-auto" />
      </div>

      {/* Collections grid skeleton */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="relative mb-4 overflow-hidden rounded-2xl">
              <Skeleton height={320} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Skeleton
                  height={28}
                  width="60%"
                  className="mb-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Skeleton
                  height={16}
                  width="40%"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
