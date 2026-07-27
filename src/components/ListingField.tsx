import { CopyButton } from './CopyButton';

interface ListingFieldProps {
  label: string;
  value: string;
  maxLength: number;
  minLength?: number;
  multiline?: boolean;
}

export function ListingField({ label, value, maxLength, minLength, multiline = false }: ListingFieldProps) {
  const length = value.length;
  const overLimit = length > maxLength;
  const underLimit = minLength !== undefined && length < minLength;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</label>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[11px] ${
              overLimit || underLimit ? 'text-risk-high' : 'text-slate-500'
            }`}
          >
            {length}/{maxLength}
            {minLength !== undefined ? ` (min ${minLength})` : ''}
          </span>
          <CopyButton value={value} />
        </div>
      </div>
      {multiline ? (
        <p className="whitespace-pre-wrap rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-slate-200">
          {value || <span className="text-slate-600">Empty</span>}
        </p>
      ) : (
        <p className="truncate rounded-lg border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-slate-200">
          {value || <span className="text-slate-600">Empty</span>}
        </p>
      )}
    </div>
  );
}
