import type { RiskLevel } from '../types/api';

const RISK_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-risk-low/15 text-risk-low border-risk-low/30',
  MEDIUM: 'bg-risk-medium/15 text-risk-medium border-risk-medium/30',
  HIGH: 'bg-risk-high/15 text-risk-high border-risk-high/30',
  UNKNOWN: 'bg-risk-unknown/15 text-risk-unknown border-risk-unknown/30',
};

interface RiskBadgeProps {
  label: string;
  level: RiskLevel;
}

export function RiskBadge({ label, level }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${RISK_STYLES[level]}`}
    >
      {label}: {level}
    </span>
  );
}
