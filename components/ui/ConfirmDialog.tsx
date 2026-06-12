'use client'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white border border-[#e8d5c4] rounded-2xl w-full max-w-sm p-6 shadow-[0_8px_32px_rgba(69,19,44,0.15)] animate-fadeIn">
        <h3 className="text-base font-semibold text-[#45132c] mb-2">{title}</h3>
        <p className="text-sm text-[#8a5a70] mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#8a5a70] hover:text-[#45132c] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {busy ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
