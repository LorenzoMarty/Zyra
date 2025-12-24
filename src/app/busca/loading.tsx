import SkeletonGrid from "@/components/SkeletonGrid";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="space-y-6">
        <div className="rounded-3xl border border-cloud bg-white p-6 shadow-card">
          <div className="skeleton animate-shimmer h-6 w-48 rounded" />
          <div className="skeleton animate-shimmer mt-3 h-4 w-72 rounded" />
        </div>
      </div>
      <div className="mt-8">
        <SkeletonGrid count={9} />
      </div>
    </main>
  );
}
