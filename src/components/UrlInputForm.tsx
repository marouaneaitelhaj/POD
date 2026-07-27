import { useMemo, type KeyboardEvent } from 'react';
import { ListChecks, Sparkles, Eraser } from 'lucide-react';
import { parseLinks, EXAMPLE_LINKS } from '../utils/links';

interface UrlInputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (links: string[]) => void;
  disabled?: boolean;
}

export function UrlInputForm({ value, onChange, onSubmit, disabled = false }: UrlInputFormProps) {
  const { validLinks, invalidLines } = useMemo(() => parseLinks(value), [value]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (validLinks.length > 0 && !disabled) onSubmit(validLinks);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="amazon-links" className="mb-2 block text-sm font-medium text-slate-300">
          Amazon product links
        </label>
        <textarea
          id="amazon-links"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={'https://www.amazon.com/dp/B0EXAMPLE1\nhttps://www.amazon.com/dp/B0EXAMPLE2'}
          rows={12}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-surface-border bg-surface-raised px-4 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus-visible:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/50 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <ListChecks size={16} className={validLinks.length > 0 ? 'text-accent' : 'text-slate-500'} />
          <span className="font-medium text-slate-200">{validLinks.length}</span>
          <span className="text-slate-500">valid link{validLinks.length === 1 ? '' : 's'}</span>
          {invalidLines.length > 0 && (
            <span className="text-risk-high">
              &middot; {invalidLines.length} invalid line{invalidLines.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(EXAMPLE_LINKS)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            <Sparkles size={13} />
            Add example links
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled || value.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-risk-high/50 hover:text-risk-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            <Eraser size={13} />
            Clear
          </button>
        </div>
      </div>

      {invalidLines.length > 0 && (
        <div className="rounded-lg border border-risk-high/30 bg-risk-high/5 px-4 py-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-risk-high">
            Invalid lines (must start with http:// or https://)
          </p>
          <ul className="space-y-1 font-mono text-xs text-slate-400">
            {invalidLines.map((line, i) => (
              <li key={`${line}-${i}`} className="truncate">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onSubmit(validLinks)}
          disabled={disabled || validLinks.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-surface-border disabled:text-slate-500"
        >
          Analyze products
        </button>
        <span className="text-xs text-slate-500">
          Tip: press <kbd className="rounded border border-surface-border bg-surface-raised px-1.5 py-0.5 font-mono">Ctrl</kbd>+
          <kbd className="rounded border border-surface-border bg-surface-raised px-1.5 py-0.5 font-mono">Enter</kbd> to submit
        </span>
      </div>
    </div>
  );
}
