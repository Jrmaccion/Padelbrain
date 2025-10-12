import { Match, Training } from '@/types';
export function calcBasicStats(matches: Match[], trainings: Training[]) {
  const wins = matches.filter(m => m.result?.outcome === 'won').length;
  return { totalMatches: matches.length, winrate: matches.length ? Math.round((wins / matches.length) * 100) : 0, totalTrainings: trainings.length };
}
