import { calcBasicStats } from '@/utils/statsCalculator'; import { Match,Training } from '@/types';
export function useStats(matches: Match[], trainings: Training[]){ return calcBasicStats(matches, trainings) }
