/**
 * Advanced Statistics Service
 *
 * Provides advanced analytics, insights, and trends for matches and trainings
 */

import { Match, Training } from '@/types';

export interface LocationStats {
  location: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface PartnerStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface TrendDataPoint {
  period: string; // e.g., "Ene 2024"
  matches: number;
  wins: number;
  winRate: number;
}

export interface StrengthWeaknessAnalysis {
  strength: string;
  count: number;
  winRate: number; // Win rate when this strength was present
}

export interface AutoInsight {
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  title: string;
  message: string;
}

/**
 * Calculate stats by location
 */
export function calculateLocationStats(matches: Match[]): LocationStats[] {
  const locationMap = new Map<string, { wins: number; losses: number }>();

  matches.forEach((match) => {
    if (!match.location) return;

    const stats = locationMap.get(match.location) || { wins: 0, losses: 0 };
    if (match.result?.outcome === 'won') {
      stats.wins++;
    } else {
      stats.losses++;
    }
    locationMap.set(match.location, stats);
  });

  return Array.from(locationMap.entries())
    .map(([location, stats]) => ({
      location,
      matches: stats.wins + stats.losses,
      wins: stats.wins,
      losses: stats.losses,
      winRate: Math.round((stats.wins / (stats.wins + stats.losses)) * 100),
    }))
    .sort((a, b) => b.matches - a.matches); // Sort by most played
}

/**
 * Calculate stats by partner
 */
export function calculatePartnerStats(matches: Match[]): PartnerStats[] {
  const partnerMap = new Map<string, { wins: number; losses: number }>();

  matches.forEach((match) => {
    if (!match.partner) return;

    const stats = partnerMap.get(match.partner) || { wins: 0, losses: 0 };
    if (match.result?.outcome === 'won') {
      stats.wins++;
    } else {
      stats.losses++;
    }
    partnerMap.set(match.partner, stats);
  });

  return Array.from(partnerMap.entries())
    .map(([name, stats]) => ({
      name,
      matches: stats.wins + stats.losses,
      wins: stats.wins,
      losses: stats.losses,
      winRate: Math.round((stats.wins / (stats.wins + stats.losses)) * 100),
    }))
    .sort((a, b) => b.winRate - a.winRate); // Sort by best win rate
}

/**
 * Calculate monthly trends (last 12 months)
 */
export function calculateMonthlyTrends(matches: Match[]): TrendDataPoint[] {
  const now = new Date();
  const months: TrendDataPoint[] = [];

  // Generate last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthMatches = matches.filter((m) => {
      const matchDate = new Date(m.date);
      return (
        matchDate.getFullYear() === date.getFullYear() && matchDate.getMonth() === date.getMonth()
      );
    });

    const wins = monthMatches.filter((m) => m.result?.outcome === 'won').length;
    const total = monthMatches.length;

    months.push({
      period: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      matches: total,
      wins,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    });
  }

  return months;
}

/**
 * Analyze strengths and weaknesses
 */
export function analyzeStrengthsWeaknesses(matches: Match[]): {
  topStrengths: StrengthWeaknessAnalysis[];
  topWeaknesses: StrengthWeaknessAnalysis[];
} {
  const strengthMap = new Map<string, { count: number; wins: number; total: number }>();
  const weaknessMap = new Map<string, { count: number; wins: number; total: number }>();

  matches.forEach((match) => {
    const isWin = match.result?.outcome === 'won';

    // Process strengths
    match.strengths?.forEach((strength) => {
      const stats = strengthMap.get(strength) || { count: 0, wins: 0, total: 0 };
      stats.count++;
      stats.total++;
      if (isWin) stats.wins++;
      strengthMap.set(strength, stats);
    });

    // Process weaknesses
    match.weaknesses?.forEach((weakness) => {
      const stats = weaknessMap.get(weakness) || { count: 0, wins: 0, total: 0 };
      stats.count++;
      stats.total++;
      if (isWin) stats.wins++;
      weaknessMap.set(weakness, stats);
    });
  });

  const topStrengths = Array.from(strengthMap.entries())
    .map(([strength, stats]) => ({
      strength,
      count: stats.count,
      winRate: Math.round((stats.wins / stats.total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topWeaknesses = Array.from(weaknessMap.entries())
    .map(([strength, stats]) => ({
      strength,
      count: stats.count,
      winRate: Math.round((stats.wins / stats.total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { topStrengths, topWeaknesses };
}

/**
 * Generate automatic insights
 */
export function generateInsights(matches: Match[], trainings: Training[]): AutoInsight[] {
  const insights: AutoInsight[] = [];

  // Calculate basic stats
  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.result?.outcome === 'won').length;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Insight 1: Win rate performance
  if (winRate >= 60) {
    insights.push({
      type: 'positive',
      icon: '🏆',
      title: 'Excelente rendimiento',
      message: `Tu win rate de ${winRate}% está por encima del promedio. ¡Sigue así!`,
    });
  } else if (winRate < 40 && totalMatches >= 5) {
    insights.push({
      type: 'negative',
      icon: '📉',
      title: 'Oportunidad de mejora',
      message: `Con un win rate de ${winRate}%, revisa tus entrenamientos y análisis de partidos.`,
    });
  }

  // Insight 2: Location analysis
  const locationStats = calculateLocationStats(matches);
  if (locationStats.length > 0) {
    const bestLocation = locationStats.reduce((best, current) =>
      current.winRate > best.winRate && current.matches >= 3 ? current : best
    );
    if (bestLocation.winRate >= 70 && bestLocation.matches >= 3) {
      insights.push({
        type: 'positive',
        icon: '📍',
        title: 'Mejor ubicación',
        message: `Tienes un ${bestLocation.winRate}% de victorias en ${bestLocation.location}. ¡Es tu terreno!`,
      });
    }
  }

  // Insight 3: Court type preference
  const interiorMatches = matches.filter((m) => m.courtType === 'interior');
  const exteriorMatches = matches.filter((m) => m.courtType === 'exterior');

  if (interiorMatches.length >= 3 && exteriorMatches.length >= 3) {
    const interiorWinRate = Math.round(
      (interiorMatches.filter((m) => m.result?.outcome === 'won').length / interiorMatches.length) *
        100
    );
    const exteriorWinRate = Math.round(
      (exteriorMatches.filter((m) => m.result?.outcome === 'won').length / exteriorMatches.length) *
        100
    );

    const diff = Math.abs(interiorWinRate - exteriorWinRate);
    if (diff >= 20) {
      const better = interiorWinRate > exteriorWinRate ? 'interior' : 'exterior';
      const betterRate = Math.max(interiorWinRate, exteriorWinRate);
      insights.push({
        type: 'neutral',
        icon: '🏟️',
        title: 'Preferencia de pista',
        message: `Rindes mejor en pistas de ${better} (${betterRate}% vs ${Math.min(interiorWinRate, exteriorWinRate)}%).`,
      });
    }
  }

  // Insight 4: Partner synergy
  const partnerStats = calculatePartnerStats(matches);
  if (partnerStats.length > 0) {
    const bestPartner = partnerStats[0];
    if (bestPartner.matches >= 5 && bestPartner.winRate >= 65) {
      insights.push({
        type: 'positive',
        icon: '🤝',
        title: 'Mejor compañero/a',
        message: `Con ${bestPartner.name} tienes un ${bestPartner.winRate}% de victorias en ${bestPartner.matches} partidos.`,
      });
    }
  }

  // Insight 5: Training consistency
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentTrainings = trainings.filter((t) => new Date(t.date) > last30Days);

  if (recentTrainings.length >= 8) {
    insights.push({
      type: 'positive',
      icon: '💪',
      title: 'Gran constancia',
      message: `${recentTrainings.length} entrenamientos en los últimos 30 días. ¡Excelente dedicación!`,
    });
  } else if (recentTrainings.length <= 2 && trainings.length > 10) {
    insights.push({
      type: 'negative',
      icon: '⏰',
      title: 'Baja actividad reciente',
      message: `Solo ${recentTrainings.length} entrenamientos este mes. Intenta mantener la regularidad.`,
    });
  }

  // Insight 6: Recent streak
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let currentStreak = 0;
  for (const match of sortedMatches) {
    if (match.result?.outcome === 'won') {
      currentStreak++;
    } else {
      break;
    }
  }

  if (currentStreak >= 3) {
    insights.push({
      type: 'positive',
      icon: '🔥',
      title: 'Racha activa',
      message: `¡${currentStreak} victorias consecutivas! Estás en tu mejor momento.`,
    });
  }

  // Insight 7: Strengths correlation
  const { topStrengths } = analyzeStrengthsWeaknesses(matches);
  if (topStrengths.length > 0) {
    const topStrength = topStrengths[0];
    if (topStrength.winRate >= 75 && topStrength.count >= 5) {
      insights.push({
        type: 'positive',
        icon: '💎',
        title: 'Fortaleza clave',
        message: `Cuando aprovechas "${topStrength.strength}", ganas el ${topStrength.winRate}% de las veces.`,
      });
    }
  }

  return insights;
}

/**
 * Calculate overall performance summary
 */
export function calculatePerformanceSummary(matches: Match[], trainings: Training[]) {
  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.result?.outcome === 'won').length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Last 30 days activity
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentMatches = matches.filter((m) => new Date(m.date) > last30Days);
  const recentTrainings = trainings.filter((t) => new Date(t.date) > last30Days);
  const recentWins = recentMatches.filter((m) => m.result?.outcome === 'won').length;
  const recentWinRate =
    recentMatches.length > 0 ? Math.round((recentWins / recentMatches.length) * 100) : 0;

  // Calculate trend (improving, stable, declining)
  const olderMatches = matches.filter((m) => {
    const date = new Date(m.date);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
    return date > twoMonthsAgo && date <= last30Days;
  });
  const olderWinRate =
    olderMatches.length > 0
      ? Math.round(
          (olderMatches.filter((m) => m.result?.outcome === 'won').length / olderMatches.length) *
            100
        )
      : 0;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentMatches.length >= 3 && olderMatches.length >= 3) {
    const diff = recentWinRate - olderWinRate;
    if (diff >= 10) trend = 'improving';
    else if (diff <= -10) trend = 'declining';
  }

  return {
    totalMatches,
    wins,
    losses,
    winRate,
    recentMatches: recentMatches.length,
    recentTrainings: recentTrainings.length,
    recentWinRate,
    trend,
    totalTrainings: trainings.length,
  };
}
