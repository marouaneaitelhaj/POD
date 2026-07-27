import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from './ToastProvider';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = 'Copy', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {copied ? <Check size={13} className="text-risk-low" /> : <Copy size={13} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
