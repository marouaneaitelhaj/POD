import { UrlInputForm } from '../components/UrlInputForm';
import { LoadingPanel } from '../components/LoadingPanel';
import { ErrorPanel } from '../components/ErrorPanel';
import type { ApiError } from '../types/api';

const ANALYZE_MESSAGES = [
  'Preparing product links',
  'Opening Amazon product pages',
  'Capturing product screenshots',
  'Analyzing copyright risk',
  'Analyzing trademark risk',
  'Calculating opportunity scores',
  'Preparing safe candidates',
];

interface InputPageProps {
  linksText: string;
  onLinksTextChange: (value: string) => void;
  onAnalyze: (links: string[]) => void;
  isAnalyzing: boolean;
  onCancelAnalyze: () => void;
  error: ApiError | null;
  onDismissError: () => void;
  onRetry: () => void;
}

export function InputPage({
  linksText,
  onLinksTextChange,
  onAnalyze,
  isAnalyzing,
  onCancelAnalyze,
  error,
  onDismissError,
  onRetry,
}: InputPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-100">Find safe Print-on-Demand opportunities</h2>
        <p className="mx-auto max-w-xl text-sm text-slate-400">
          Paste Amazon product links below. We&apos;ll scrape each product, screen it for copyright, trademark,
          and platform-policy risk, and surface only the safe candidates worth pursuing.
        </p>
      </div>

      {error && <ErrorPanel error={error} onDismiss={onDismissError} onRetry={onRetry} />}

      {isAnalyzing ? (
        <LoadingPanel
          messages={ANALYZE_MESSAGES}
          note="Analyzing multiple products can take several minutes — feel free to keep this tab open while it runs."
          onCancel={onCancelAnalyze}
        />
      ) : (
        <div className="rounded-xl border border-surface-border bg-surface-raised p-5 shadow-elevated">
          <UrlInputForm
            value={linksText}
            onChange={onLinksTextChange}
            onSubmit={onAnalyze}
            disabled={isAnalyzing}
          />
        </div>
      )}
    </div>
  );
}
