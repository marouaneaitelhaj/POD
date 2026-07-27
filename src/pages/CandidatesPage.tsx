import { useMemo, useState } from 'react';
import { RotateCcw, SearchX } from 'lucide-react';
import type { Candidate } from '../types/api';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateFilters, DEFAULT_FILTERS, type FilterState, type SortOption } from '../components/CandidateFilters';
import { SelectionBar } from '../components/SelectionBar';
import { EmptyState } from '../components/EmptyState';
import { ErrorPanel } from '../components/ErrorPanel';
import type { ApiError } from '../types/api';

const RISK_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, UNKNOWN: 3 };

function riskRank(c: Candidate): number {
  return RISK_ORDER[c.copyrightRisk] + RISK_ORDER[c.trademarkRisk] + RISK_ORDER[c.platformRisk];
}

interface CandidatesPageProps {
  candidates: Candidate[];
  selectedAsin: string | null;
  onSelect: (asin: string) => void;
  onGenerate: () => void;
  onStartOver: () => void;
  error: ApiError | null;
  onDismissError: () => void;
  onRetry: () => void;
}

export function CandidatesPage({
  candidates,
  selectedAsin,
  onSelect,
  onGenerate,
  onStartOver,
  error,
  onDismissError,
  onRetry,
}: CandidatesPageProps) {
  const [sort, setSort] = useState<SortOption>('score-desc');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const visibleCandidates = useMemo(() => {
    const filtered = candidates.filter((c) => {
      if (c.score < filters.minScore) return false;
      if (filters.copyrightRisk !== 'ANY' && c.copyrightRisk !== filters.copyrightRisk) return false;
      if (filters.trademarkRisk !== 'ANY' && c.trademarkRisk !== filters.trademarkRisk) return false;
      if (filters.platformRisk !== 'ANY' && c.platformRisk !== filters.platformRisk) return false;
      return true;
    });

    const sorted = [...filtered];
    if (sort === 'score-desc') sorted.sort((a, b) => b.score - a.score);
    else if (sort === 'risk-asc') sorted.sort((a, b) => riskRank(a) - riskRank(b));
    else if (sort === 'title-asc') sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [candidates, filters, sort]);

  const selectedCandidate = candidates.find((c) => c.asin === selectedAsin) ?? null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 pb-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {candidates.length} safe candidate{candidates.length === 1 ? '' : 's'} found
          </h2>
          <p className="text-sm text-slate-500">Select exactly one candidate to generate a POD concept for.</p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RotateCcw size={13} />
          Start over
        </button>
      </div>

      {error && <ErrorPanel error={error} onDismiss={onDismissError} onRetry={onRetry} />}

      {candidates.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No safe candidates were returned for these links"
          description="Every scraped product was flagged for copyright, trademark, or platform-policy risk. Try a different set of links."
          action={
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-surface hover:bg-accent-hover"
            >
              Start over
            </button>
          }
        />
      ) : (
        <>
          <CandidateFilters
            sort={sort}
            onSortChange={setSort}
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={visibleCandidates.length}
            totalCount={candidates.length}
          />

          {visibleCandidates.length === 0 ? (
            <EmptyState
              title="No candidates match these filters"
              description="Loosen the score or risk filters to see more results."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.asin}
                  candidate={candidate}
                  selected={candidate.asin === selectedAsin}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedCandidate && (
        <SelectionBar title={selectedCandidate.title} asin={selectedCandidate.asin} onGenerate={onGenerate} />
      )}
    </div>
  );
}
