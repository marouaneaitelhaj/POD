import { WandSparkles } from 'lucide-react';

interface SelectionBarProps {
  title: string;
  asin: string;
  onGenerate: () => void;
}

export function SelectionBar({ title, asin, onGenerate }: SelectionBarProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-surface-border bg-surface-elevated/95 px-4 py-3 shadow-elevated backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
          <p className="font-mono text-xs text-slate-500">{asin}</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <WandSparkles size={16} />
          Generate Design &amp; Listing
        </button>
      </div>
    </div>
  );
}
