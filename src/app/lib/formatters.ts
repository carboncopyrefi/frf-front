export const formatScore = (v: number | null): string =>
  v === null ? 'Awaiting Evaluation' : `${(v * 100).toFixed(1)}%`;

export const getScoreClasses = (score: number | null): string => {
  if ((score ?? 0) >= 0.9) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  }
  if ((score ?? 0) >= 0.50) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  }
  return 'bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-300';
};