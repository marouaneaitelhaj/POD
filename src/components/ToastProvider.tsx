import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-risk-low/40 bg-surface-elevated text-risk-low',
  error: 'border-risk-high/40 bg-surface-elevated text-risk-high',
  info: 'border-accent/40 bg-surface-elevated text-accent',
};

const VARIANT_ICONS: Record<ToastVariant, typeof CircleCheck> = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const Icon = VARIANT_ICONS[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-elevated ${VARIANT_STYLES[toast.variant]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-slate-100">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
