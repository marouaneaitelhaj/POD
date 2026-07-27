interface ScoreBadgeProps {
  score: number;
}

function scoreStyles(score: number): string {
  if (score >= 70) return 'border-risk-low/40 bg-risk-low/10 text-risk-low';
  if (score >= 40) return 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium';
  return 'border-risk-high/40 bg-risk-high/10 text-risk-high';
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-bold ${scoreStyles(score)}`}
      title="Opportunity score"
    >
      <span className="text-lg leading-none">{score}</span>
      <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">score</span>
    </div>
  );
}
