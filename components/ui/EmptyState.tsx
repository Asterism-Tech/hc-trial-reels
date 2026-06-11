interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      {icon && <div className="text-[#dcc8b0] mb-4 text-4xl">{icon}</div>}
      <h3 className="text-[#8a5a70] font-medium text-base mb-1">{title}</h3>
      {description && <p className="text-[#a07080] text-sm mb-4 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
