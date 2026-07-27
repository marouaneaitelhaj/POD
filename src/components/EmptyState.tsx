import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-surface-border bg-surface-raised/50 px-6 py-14 text-center">
      <Icon size={32} className="text-slate-500" aria-hidden="true" />
      <p className="text-base font-semibold text-slate-200">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
