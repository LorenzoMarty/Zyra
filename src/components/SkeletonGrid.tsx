export default function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="rounded-2xl border border-cloud bg-white p-4 shadow-card"
        >
          <div className="skeleton animate-shimmer h-4 w-24 rounded-full" />
          <div className="skeleton animate-shimmer mt-4 h-40 rounded-xl" />
          <div className="mt-4 space-y-2">
            <div className="skeleton animate-shimmer h-4 w-full rounded" />
            <div className="skeleton animate-shimmer h-4 w-2/3 rounded" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="skeleton animate-shimmer h-10 w-full rounded-xl" />
            <div className="skeleton animate-shimmer h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
