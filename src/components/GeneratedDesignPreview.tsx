import { useState } from 'react';
import { FolderClosed, ImageOff } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface GeneratedDesignPreviewProps {
  designImageUrl: string;
  designPath: string;
}

export function GeneratedDesignPreview({ designImageUrl, designPath }: GeneratedDesignPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const hasRenderableImage = designImageUrl.trim().length > 0 && !imageError;

  return (
    <div className="space-y-3">
      <div className="flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-surface-elevated">
        {hasRenderableImage ? (
          <img
            src={designImageUrl}
            alt="Generated POD design"
            className="h-full w-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <ImageOff size={36} className="text-slate-600" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-300">No browser-accessible image URL</p>
            <p className="text-xs text-slate-500">
              The generated image was saved locally, but browsers cannot directly display Windows file paths.
            </p>
          </div>
        )}
      </div>

      {designPath && (
        <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2">
          <FolderClosed size={15} className="shrink-0 text-slate-500" aria-hidden="true" />
          <code className="flex-1 truncate text-xs text-slate-400" title={designPath}>
            {designPath}
          </code>
          <CopyButton value={designPath} label="Copy local path" />
        </div>
      )}
    </div>
  );
}
