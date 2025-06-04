export function ProductGridSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[11/12] rounded-3xl bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionSliderSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="min-w-[300px] animate-pulse">
          <div className="aspect-square rounded-2xl bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-4 h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="h-[600px] w-full rounded-3xl bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

export function BlogSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video rounded-2xl bg-neutral-200 dark:bg-neutral-700" />
          <div className="mt-4 space-y-2">
            <div className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      ))}
    </div>
  );
}