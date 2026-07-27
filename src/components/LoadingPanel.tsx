import { LoaderCircle, CircleX } from 'lucide-react';
import { useRotatingMessage } from '../hooks/useRotatingMessage';

interface LoadingPanelProps {
  messages: string[];
  note?: string;
  onCancel: () => void;
}

export function LoadingPanel({ messages, note, onCancel }: LoadingPanelProps) {
  const activeMessage = useRotatingMessage(messages, 2600, true);

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-surface-border bg-surface-raised px-6 py-14 text-center">
      <LoaderCircle size={36} className="animate-spin text-accent" aria-hidden="true" />

      <div className="space-y-1" role="status" aria-live="polite">
        <p className="text-base font-semibold text-slate-100">{activeMessage}&hellip;</p>
        {note && <p className="max-w-md text-sm text-slate-500">{note}</p>}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-risk-high/50 hover:text-risk-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <CircleX size={15} />
        Cancel
      </button>
    </div>
  );
}
