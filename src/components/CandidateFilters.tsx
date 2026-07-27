import type { RiskLevel } from '../types/api';

export type SortOption = 'score-desc' | 'risk-asc' | 'title-asc';

export interface FilterState {
  minScore: number;
  copyrightRisk: RiskLevel | 'ANY';
  trademarkRisk: RiskLevel | 'ANY';
  platformRisk: RiskLevel | 'ANY';
}

interface CandidateFiltersProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const RISK_OPTIONS: (RiskLevel | 'ANY')[] = ['ANY', 'LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'];

function selectClass() {
  return 'rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';
}

export function CandidateFilters({
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: CandidateFiltersProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-surface-border bg-surface-raised/60 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Sort by
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={selectClass()}
          >
            <option value="score-desc">Highest score</option>
            <option value="risk-asc">Lowest risk</option>
            <option value="title-asc">Product title</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Min score
          <input
            type="number"
            min={0}
            max={100}
            value={filters.minScore}
            onChange={(e) =>
              onFiltersChange({ ...filters, minScore: Number(e.target.value) || 0 })
            }
            className={`${selectClass()} w-20`}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Copyright risk
          <select
            value={filters.copyrightRisk}
            onChange={(e) =>
              onFiltersChange({ ...filters, copyrightRisk: e.target.value as RiskLevel | 'ANY' })
            }
            className={selectClass()}
          >
            {RISK_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Trademark risk
          <select
            value={filters.trademarkRisk}
            onChange={(e) =>
              onFiltersChange({ ...filters, trademarkRisk: e.target.value as RiskLevel | 'ANY' })
            }
            className={selectClass()}
          >
            {RISK_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Platform risk
          <select
            value={filters.platformRisk}
            onChange={(e) =>
              onFiltersChange({ ...filters, platformRisk: e.target.value as RiskLevel | 'ANY' })
            }
            className={selectClass()}
          >
            {RISK_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="whitespace-nowrap text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-300">{resultCount}</span> of {totalCount}
      </p>
    </div>
  );
}

export const DEFAULT_FILTERS: FilterState = {
  minScore: 0,
  copyrightRisk: 'ANY',
  trademarkRisk: 'ANY',
  platformRisk: 'ANY',
};
