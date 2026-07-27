import { ImageOff } from 'lucide-react';
import type { Candidate } from '../types/api';
import { LoadingPanel } from '../components/LoadingPanel';

const GENERATE_MESSAGES = [
  'Preparing creative direction',
  'Writing an original redesign prompt',
  'Generating the design image',
  'Creating the Amazon Merch listing',
  'Saving the generated result',
];

interface GeneratingPageProps {
  candidate: Candidate | null;
  onCancel: () => void;
}

export function GeneratingPage({ candidate, onCancel }: GeneratingPageProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      {candidate && (
        <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-raised p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border bg-surface-elevated">
            {candidate.imageUrl ? (
              <img src={candidate.imageUrl} alt={candidate.title} className="h-full w-full object-cover" />
            ) : (
              <ImageOff size={20} className="text-slate-600" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-100">{candidate.title}</p>
            <p className="font-mono text-xs text-slate-500">{candidate.asin}</p>
          </div>
        </div>
      )}

      <LoadingPanel
        messages={GENERATE_MESSAGES}
        note="Generating an image and listing can take several minutes. Keep this tab open until it finishes."
        onCancel={onCancel}
      />
    </div>
  );
}
