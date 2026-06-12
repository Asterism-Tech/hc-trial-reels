export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-[#e8d5c4] rounded-xl p-4">
      <div className="h-4 skeleton-shimmer rounded w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 skeleton-shimmer rounded mb-2"
          style={{ width: `${60 + Math.random() * 30}%`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="h-10 skeleton-shimmer rounded" />
  )
}
