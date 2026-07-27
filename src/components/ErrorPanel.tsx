import { TriangleAlert, RotateCcw } from 'lucide-react';
import type { ApiError } from '../types/api';

interface ErrorPanelProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorPanel({ error, onRetry, onDismiss }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-risk-high/30 bg-risk-high/5 p-5 text-sm"
    >
      <div className="flex items-start gap-3">
        <TriangleAlert size={20} className="mt-0.5 shrink-0 text-risk-high" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-slate-100">{error.message}</p>
          {error.details && (
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-300">
                Technical details
              </summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-black/30 p-2 text-slate-400">
                {error.details}
              </pre>
            </details>
          )}
        </div>
      </div>
      {(onRetry || onDismiss) && (
        <div className="flex gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-md border border-risk-high/40 bg-surface-raised px-3 py-1.5 text-xs font-medium text-slate-100 transition-colors hover:border-risk-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <RotateCcw size={13} />
              Try again
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
