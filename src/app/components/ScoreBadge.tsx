import { formatScore, getScoreClasses } from '~/lib/formatters';

export function ScoreBadge({ score }: { score: number | null }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getScoreClasses(score)}`}>
      {formatScore(score)}
    </span>
  );
}