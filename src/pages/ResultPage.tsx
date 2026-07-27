import { FileJson, FileText, RefreshCw, ArrowLeft, RotateCcw } from 'lucide-react';
import type { Candidate, GenerateResponse } from '../types/api';
import { GeneratedDesignPreview } from '../components/GeneratedDesignPreview';
import { ListingField } from '../components/ListingField';
import { CopyButton } from '../components/CopyButton';
import { ErrorPanel } from '../components/ErrorPanel';
import { downloadListingAsJson, downloadListingAsTxt, listingAsPlainText } from '../utils/downloads';
import type { ApiError } from '../types/api';

interface ResultPageProps {
  result: GenerateResponse;
  sourceCandidate: Candidate | null;
  onGenerateAnother: () => void;
  onBackToCandidates: () => void;
  onNewAnalysis: () => void;
  error: ApiError | null;
  onDismissError: () => void;
}

export function ResultPage({
  result,
  sourceCandidate,
  onGenerateAnother,
  onBackToCandidates,
  onNewAnalysis,
  error,
  onDismissError,
}: ResultPageProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Generated design &amp; listing</h2>
        <p className="text-sm text-slate-500">Review the generated concept below before publishing.</p>
      </div>

      {error && <ErrorPanel error={error} onDismiss={onDismissError} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-surface-border bg-surface-raised p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Generated design</h3>
          <GeneratedDesignPreview designImageUrl={result.designImageUrl} designPath={result.designPath} />
        </section>

        <section className="space-y-3 rounded-xl border border-surface-border bg-surface-raised p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Original source product</h3>
          {sourceCandidate ? (
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-elevated">
                {sourceCandidate.imageUrl && (
                  <img
                    src={sourceCandidate.imageUrl}
                    alt={sourceCandidate.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium text-slate-100">{sourceCandidate.title}</p>
                <p className="text-xs text-slate-500">{sourceCandidate.brand}</p>
                {sourceCandidate.amazonUrl && (
                  <a
                    href={sourceCandidate.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    View on Amazon
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Source candidate details are unavailable for this session.</p>
          )}
          <div className="flex items-center gap-2 border-t border-surface-border pt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">ASIN</span>
            <code className="font-mono text-sm text-slate-200">{result.asin}</code>
            <CopyButton value={result.asin} />
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border border-surface-border bg-surface-raised p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Amazon Merch listing</h3>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={listingAsPlainText(result)} label="Copy all listing" />
            <button
              type="button"
              onClick={() => downloadListingAsJson(result)}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <FileJson size={13} />
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => downloadListingAsTxt(result)}
              className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <FileText size={13} />
              Download TXT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ListingField label="Design title" value={result.designTitle} maxLength={60} />
          <ListingField label="Brand" value={result.brand} maxLength={50} />
          <ListingField label="Feature bullet 1" value={result.featureBullet1} maxLength={256} multiline />
          <ListingField label="Feature bullet 2" value={result.featureBullet2} maxLength={256} multiline />
        </div>
        <ListingField
          label="Product description"
          value={result.productDescription}
          maxLength={2000}
          minLength={75}
          multiline
        />
      </section>

      <div className="flex flex-wrap gap-3 border-t border-surface-border pt-5">
        <button
          type="button"
          onClick={onGenerateAnother}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RefreshCw size={15} />
          Generate another candidate
        </button>
        <button
          type="button"
          onClick={onBackToCandidates}
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={15} />
          Return to candidate results
        </button>
        <button
          type="button"
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RotateCcw size={15} />
          Start a new analysis
        </button>
      </div>
    </div>
  );
}
