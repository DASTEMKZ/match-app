'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; message: string; type: ToastType }

const ToastCtx = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} })

export function useToast() { return useContext(ToastCtx) }

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const icons = { success: CheckCircle, error: AlertCircle, info: Info }
  const colors = {
    success: 'border-[#B5F23A]/30 bg-[#1A3A1A]',
    error: 'border-red-500/30 bg-[#3A1A1A]',
    info: 'border-blue-500/30 bg-[#1A2A3A]',
  }
  const iconColors = { success: 'text-[#B5F23A]', error: 'text-red-400', info: 'text-blue-400' }

  return (
    <ToastCtx.Provider value={{ toast }}>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className={`flex items-start gap-3 border rounded-xl px-4 py-3 shadow-xl animate-fade-in max-w-sm ${colors[t.type]}`}>
              <Icon size={18} className={`mt-0.5 shrink-0 ${iconColors[t.type]}`} />
              <p className="text-sm text-[#F5F5F0] flex-1">{t.message}</p>
              <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} className="text-[#8FAD8F] hover:text-[#F5F5F0]">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}
