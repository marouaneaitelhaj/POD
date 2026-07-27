import { Check, Sparkles, Trash2 } from 'lucide-react';

export type Stage = 'input' | 'candidates' | 'generating' | 'result';

const STAGES: { key: Stage; label: string; step: number }[] = [
  { key: 'input', label: 'Add Links', step: 1 },
  { key: 'candidates', label: 'Choose Candidate', step: 2 },
  { key: 'generating', label: 'Generate', step: 3 },
  { key: 'result', label: 'Result', step: 4 },
];

interface AppHeaderProps {
  currentStage: Stage;
  onClearSession: () => void;
}

export function AppHeader({ currentStage, onClearSession }: AppHeaderProps) {
  const currentStep = STAGES.find((s) => s.key === currentStage)?.step ?? 1;

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Sparkles size={18} />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-100">POD Opportunity Studio</h1>
              <p className="text-xs leading-tight text-slate-500">Amazon research &rarr; safe POD concepts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSession}
            className="inline-flex items-center gap-1.5 rounded-md border border-surface-border px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-risk-high/50 hover:text-risk-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Trash2 size={13} />
            Clear saved session
          </button>
        </div>

        <ol className="flex items-center gap-2" aria-label="Progress">
          {STAGES.map((stage, i) => {
            const isComplete = stage.step < currentStep;
            const isCurrent = stage.step === currentStep;
            return (
              <li key={stage.key} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                      isComplete
                        ? 'bg-accent text-surface'
                        : isCurrent
                          ? 'border-2 border-accent text-accent'
                          : 'border border-surface-border text-slate-500'
                    }`}
                  >
                    {isComplete ? <Check size={12} /> : stage.step}
                  </span>
                  <span
                    className={`hidden text-xs font-medium sm:inline ${
                      isCurrent ? 'text-slate-100' : isComplete ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <span
                    className={`h-px flex-1 ${isComplete ? 'bg-accent/60' : 'bg-surface-border'}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
