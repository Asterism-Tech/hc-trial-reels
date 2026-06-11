export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white border border-[#e8d5c4] rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-[#f0e6d3] rounded w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[#f0e6d3] rounded mb-2"
          style={{ width: `${60 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="h-10 bg-[#f0e6d3] rounded animate-pulse" />
  )
}
