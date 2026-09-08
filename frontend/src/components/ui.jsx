// Minimal shadcn-style UI primitives (Button, Badge, Card, Input, Dialog).
import { useEffect } from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    software: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    hardware: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    tech: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    theme: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-sm ${onClick ? 'cursor-pointer transition hover:border-violet-500/50 hover:bg-zinc-900' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${props.className || ''}`}
    />
  )
}

export function Button({ children, variant = 'default', className = '', ...props }) {
  const styles = {
    default: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700',
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
  }
  return (
    <button {...props} className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Dialog({ open, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Close"
        >✕</button>
        {children}
      </div>
    </div>
  )
}

export function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl border-t border-zinc-700 bg-zinc-900 shadow-2xl flex flex-col animate-[slideup_.2s_ease-out]">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-zinc-700" aria-hidden />
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Close filters"
          >✕</button>
        </div>
        <div className="overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
      <style>{`@keyframes slideup { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}

export function FilterChip({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-sm transition ${
        active
          ? 'border-violet-500/60 bg-violet-500/15 text-violet-200'
          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && <span className="text-xs text-zinc-500">{count}</span>}
    </button>
  )
}
