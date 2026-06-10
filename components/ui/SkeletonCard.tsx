export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 animate-pulse">
      <div className="h-4 bg-[#2A2A2A] rounded w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[#2A2A2A] rounded mb-2"
          style={{ width: `${60 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="h-10 bg-[#2A2A2A] rounded animate-pulse" />
  )
}
