import { useState } from 'react';
import { ExternalLink, ImageOff, ShieldAlert, Sparkles } from 'lucide-react';
import type { Candidate } from '../types/api';
import { RiskBadge } from './RiskBadge';
import { ScoreBadge } from './ScoreBadge';
import { CopyButton } from './CopyButton';

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onSelect: (asin: string) => void;
}

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = candidate.imageUrl.length > 0 && !imageError;

  return (
    <article
      className={`flex flex-col gap-3 rounded-xl border bg-surface-raised p-4 shadow-elevated transition-colors ${
        selected ? 'border-accent ring-1 ring-accent/40' : 'border-surface-border hover:border-surface-border/80'
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border bg-surface-elevated">
          {hasImage ? (
            <img
              src={candidate.imageUrl}
              alt={candidate.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImageOff size={22} className="text-slate-600" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100">{candidate.title}</h3>
          <p className="text-xs text-slate-500">
            {candidate.brand && <span>{candidate.brand}</span>}
            {candidate.brand && candidate.asin && <span> &middot; </span>}
            <span className="font-mono">{candidate.asin}</span>
          </p>
        </div>
        <ScoreBadge score={candidate.score} />
      </div>

      {candidate.category && (
        <p className="truncate text-xs text-slate-500" title={candidate.category}>
          {candidate.category}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        <RiskBadge label="Copyright" level={candidate.copyrightRisk} />
        <RiskBadge label="Trademark" level={candidate.trademarkRisk} />
        <RiskBadge label="Platform" level={candidate.platformRisk} />
      </div>

      <div className="space-y-2 rounded-lg bg-surface-elevated/60 p-3 text-xs">
        <div className="flex gap-1.5">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-slate-300">{candidate.productIdea}</p>
        </div>
        {candidate.reason && (
          <div className="flex gap-1.5">
            <ShieldAlert size={13} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-slate-400">{candidate.reason}</p>
          </div>
        )}
        {candidate.saferAlternative && (
          <p className="border-t border-surface-border pt-2 text-slate-500">
            <span className="font-semibold text-slate-400">Safer alternative: </span>
            {candidate.saferAlternative}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {candidate.amazonUrl && (
          <a
            href={candidate.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ExternalLink size={13} />
            Open on Amazon
          </a>
        )}
        {candidate.screenshotPath && (
          <CopyButton value={candidate.screenshotPath} label="Copy screenshot path" />
        )}
      </div>

      {candidate.screenshotPath && (
        <p className="truncate font-mono text-[11px] text-slate-600" title={candidate.screenshotPath}>
          {candidate.screenshotPath}
        </p>
      )}

      <label className="mt-1 flex items-center gap-2 border-t border-surface-border pt-3 text-sm">
        <input
          type="radio"
          name="selected-candidate"
          checked={selected}
          onChange={() => onSelect(candidate.asin)}
          className="h-4 w-4 accent-accent"
        />
        <button
          type="button"
          onClick={() => onSelect(candidate.asin)}
          className={`ml-auto rounded-md px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            selected
              ? 'bg-accent text-surface'
              : 'border border-surface-border text-slate-200 hover:border-accent/50 hover:text-accent'
          }`}
        >
          {selected ? 'Selected' : 'Select candidate'}
        </button>
      </label>
    </article>
  );
}
