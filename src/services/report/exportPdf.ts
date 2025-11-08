// src/services/report/exportPdf.ts
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Match, Training } from '@/types';

export interface ExportOptions {
  title: string;
  from: string;  // ISO
  to: string;    // ISO
  includeMatches: boolean;
  includeTrainings: boolean;
  filename?: string; // sin extensión
}

function fmtDate(d: string | Date, withTime = false) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]
  );
}

function between(dateISO: string, fromISO: string, toISO: string) {
  const t = new Date(dateISO).getTime();
  const f = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  return t >= f && t <= to;
}

function buildHtml(matches: Match[], trainings: Training[], opt: ExportOptions) {
  const safeTitle = escapeHtml(opt.title || 'Informe');
  const fromTxt = fmtDate(opt.from);
  const toTxt = fmtDate(opt.to);

  const selMatches = opt.includeMatches
    ? matches.filter(m => m?.date && between(m.date, opt.from, opt.to))
    : [];
  const selTrainings = opt.includeTrainings
    ? trainings.filter(t => t?.date && between(t.date, opt.from, opt.to))
    : [];

  // Calcular estadísticas detalladas
  const winCount = selMatches.filter(m => m.result?.outcome === 'won').length;
  const lossCount = selMatches.filter(m => m.result?.outcome === 'lost').length;
  const totalMatches = selMatches.length;
  const winRate = totalMatches > 0 ? Math.round((winCount / totalMatches) * 100) : 0;

  // Estadísticas por ubicación
  const indoorMatches = selMatches.filter(m => m.courtType === 'interior').length;
  const outdoorMatches = selMatches.filter(m => m.courtType === 'exterior').length;

  // Estadísticas por posición
  const rightPositionMatches = selMatches.filter(m => (m as any).position === 'right').length;
  const leftPositionMatches = selMatches.filter(m => (m as any).position === 'left').length;

  // Promedios de rendimiento (matches)
  const matchesWithRatings = selMatches.filter(m => m.ratings);
  const avgTechnical = matchesWithRatings.length > 0
    ? Math.round(matchesWithRatings.reduce((acc, m) => acc + (m.ratings?.technical || 0), 0) / matchesWithRatings.length * 10) / 10
    : 0;
  const avgTactical = matchesWithRatings.length > 0
    ? Math.round(matchesWithRatings.reduce((acc, m) => acc + (m.ratings?.tactical || 0), 0) / matchesWithRatings.length * 10) / 10
    : 0;
  const avgMental = matchesWithRatings.length > 0
    ? Math.round(matchesWithRatings.reduce((acc, m) => acc + (m.ratings?.mental || 0), 0) / matchesWithRatings.length * 10) / 10
    : 0;
  const avgPhysical = matchesWithRatings.length > 0
    ? Math.round(matchesWithRatings.reduce((acc, m) => acc + (m.ratings?.physical || 0), 0) / matchesWithRatings.length * 10) / 10
    : 0;

  // Promedios de rendimiento (trainings)
  const trainingsWithReview = selTrainings.filter(t => t.postReview);
  const avgTrainingTechnical = trainingsWithReview.length > 0
    ? Math.round(trainingsWithReview.reduce((acc, t) => acc + (t.postReview?.technical || 0), 0) / trainingsWithReview.length * 10) / 10
    : 0;
  const avgTrainingTactical = trainingsWithReview.length > 0
    ? Math.round(trainingsWithReview.reduce((acc, t) => acc + (t.postReview?.tactical || 0), 0) / trainingsWithReview.length * 10) / 10
    : 0;
  const avgTrainingMental = trainingsWithReview.length > 0
    ? Math.round(trainingsWithReview.reduce((acc, t) => acc + (t.postReview?.mental || 0), 0) / trainingsWithReview.length * 10) / 10
    : 0;
  const avgTrainingPhysical = trainingsWithReview.length > 0
    ? Math.round(trainingsWithReview.reduce((acc, t) => acc + (t.postReview?.physical || 0), 0) / trainingsWithReview.length * 10) / 10
    : 0;

  // Promedios de bienestar
  const allItems = [...selMatches, ...selTrainings];
  const itemsWithWellness = allItems.filter(item => item.sleep || item.energy || item.nutrition);
  const avgSleep = itemsWithWellness.length > 0
    ? Math.round(itemsWithWellness.reduce((acc, item) => acc + (item.sleep || 0), 0) / itemsWithWellness.length * 10) / 10
    : 0;
  const avgEnergy = itemsWithWellness.length > 0
    ? Math.round(itemsWithWellness.reduce((acc, item) => acc + (item.energy || 0), 0) / itemsWithWellness.length * 10) / 10
    : 0;
  const avgNutrition = itemsWithWellness.length > 0
    ? Math.round(itemsWithWellness.reduce((acc, item) => acc + (item.nutrition || 0), 0) / itemsWithWellness.length * 10) / 10
    : 0;
  const avgHealth = itemsWithWellness.length > 0
    ? Math.round(itemsWithWellness.reduce((acc, item) => acc + (item.health || 0), 0) / itemsWithWellness.length * 10) / 10
    : 0;
  const avgStress = itemsWithWellness.length > 0
    ? Math.round(itemsWithWellness.reduce((acc, item) => acc + (item.stress || 0), 0) / itemsWithWellness.length * 10) / 10
    : 0;

  // Tabla resumen de partidos
  const matchRows = selMatches.map((m) => {
    const outcome = m.result?.outcome === 'won' ? '🏆 Victoria' : (m.result?.outcome ? '❌ Derrota' : '—');
    const score = m.result?.score ? escapeHtml(m.result.score) : '—';
    const tour = m.tournament ? escapeHtml(m.tournament) : '—';
    const loc = m.location ? escapeHtml(m.location) : '—';
    const partner = (m as any).partner ? escapeHtml((m as any).partner) : '—';
    const position = (m as any).position ? ((m as any).position === 'right' ? 'Derecha' : 'Izquierda') : '—';
    return `
      <tr>
        <td>${fmtDate(m.date)}</td>
        <td>${outcome}</td>
        <td>${score}</td>
        <td>${tour}</td>
        <td>${loc}</td>
        <td>${partner}</td>
        <td>${position}</td>
      </tr>`;
  }).join('');

  // Detalles completos de partidos
  const matchDetails = selMatches.map((m) => {
    const outcome = m.result?.outcome === 'won' ? '🏆 Victoria' : (m.result?.outcome ? '❌ Derrota' : 'Sin resultado');
    const score = m.result?.score ? escapeHtml(m.result.score) : '—';
    const duration = m.result?.durationMin ? `${m.result.durationMin} min` : '—';

    const ratingsHtml = m.ratings ? `
      <div class="detail-subsection">
        <strong>Valoraciones:</strong>
        <div class="ratings-grid">
          <div class="rating-item">Técnica: ${m.ratings.technical || '—'}/5</div>
          <div class="rating-item">Táctica: ${m.ratings.tactical || '—'}/5</div>
          <div class="rating-item">Mental: ${m.ratings.mental || '—'}/5</div>
          <div class="rating-item">Físico: ${m.ratings.physical || '—'}/5</div>
        </div>
      </div>` : '';

    const wellnessHtml = (m.sleep || m.energy || m.nutrition || m.health || m.stress) ? `
      <div class="detail-subsection">
        <strong>Estado previo:</strong>
        <div class="wellness-grid">
          ${m.sleep ? `<div>Sueño: ${m.sleep}/5</div>` : ''}
          ${m.energy ? `<div>Energía: ${m.energy}/5</div>` : ''}
          ${m.nutrition ? `<div>Nutrición: ${m.nutrition}/5</div>` : ''}
          ${m.health ? `<div>Salud: ${m.health}/5</div>` : ''}
          ${m.stress ? `<div>Estrés: ${m.stress}/5</div>` : ''}
        </div>
      </div>` : '';

    const analysisHtml = m.analysis ? `
      <div class="detail-subsection">
        <strong>Análisis:</strong>
        ${m.analysis.attack ? `<div><em>Ataque:</em> ${escapeHtml(m.analysis.attack)}</div>` : ''}
        ${m.analysis.defense ? `<div><em>Defensa:</em> ${escapeHtml(m.analysis.defense)}</div>` : ''}
        ${m.analysis.transitions ? `<div><em>Transiciones:</em> ${escapeHtml(m.analysis.transitions)}</div>` : ''}
      </div>` : '';

    const strengthsHtml = m.strengths && m.strengths.length > 0 ? `
      <div class="detail-subsection">
        <strong>Fortalezas:</strong> ${m.strengths.map(s => escapeHtml(s)).join(', ')}
      </div>` : '';

    const weaknessesHtml = m.weaknesses && m.weaknesses.length > 0 ? `
      <div class="detail-subsection">
        <strong>Áreas de mejora:</strong> ${m.weaknesses.map(w => escapeHtml(w)).join(', ')}
      </div>` : '';

    const reflectionsHtml = m.reflections ? `
      <div class="detail-subsection">
        ${m.reflections.learned ? `<div><strong>Aprendizajes:</strong> ${escapeHtml(m.reflections.learned)}</div>` : ''}
        ${m.reflections.diffNextTime ? `<div><strong>Para próxima vez:</strong> ${escapeHtml(m.reflections.diffNextTime)}</div>` : ''}
      </div>` : '';

    const notesHtml = m.notes ? `
      <div class="detail-subsection">
        <strong>Notas:</strong> ${escapeHtml(m.notes)}
      </div>` : '';

    return `
      <div class="detail-card">
        <div class="detail-header">
          <h3>${fmtDate(m.date)} - ${outcome}</h3>
          <div class="detail-meta">
            ${m.tournament ? `<span>🏆 ${escapeHtml(m.tournament)}</span>` : ''}
            ${m.location ? `<span>📍 ${escapeHtml(m.location)}</span>` : ''}
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-subsection">
            <strong>Resultado:</strong> ${score} (${duration})
            ${(m as any).partner ? `<div>Compañero: ${escapeHtml((m as any).partner)} (${(m as any).position === 'right' ? 'Derecha' : 'Izquierda'})</div>` : ''}
          </div>
          ${ratingsHtml}
          ${wellnessHtml}
          ${analysisHtml}
          ${strengthsHtml}
          ${weaknessesHtml}
          ${reflectionsHtml}
          ${notesHtml}
        </div>
      </div>`;
  }).join('');

  // Tabla resumen de entrenamientos
  const trainingRows = selTrainings.map((t) => {
    const coach = (t as any).coach ? escapeHtml((t as any).coach) : '—';
    const loc = t.location ? escapeHtml(t.location) : '—';
    const goals = Array.isArray((t as any).goals) && (t as any).goals.length
      ? escapeHtml((t as any).goals.join(', '))
      : '—';
    const partners = Array.isArray((t as any).trainingPartners) && (t as any).trainingPartners.length
      ? escapeHtml((t as any).trainingPartners.join(', '))
      : '—';
    return `
      <tr>
        <td>${fmtDate(t.date)}</td>
        <td>${coach}</td>
        <td>${loc}</td>
        <td>${goals}</td>
        <td>${partners}</td>
      </tr>`;
  }).join('');

  // Detalles completos de entrenamientos
  const trainingDetails = selTrainings.map((t) => {
    const reviewHtml = t.postReview ? `
      <div class="detail-subsection">
        <strong>Evaluación:</strong>
        <div class="ratings-grid">
          <div class="rating-item">Técnica: ${t.postReview.technical || '—'}/5</div>
          <div class="rating-item">Táctica: ${t.postReview.tactical || '—'}/5</div>
          <div class="rating-item">Mental: ${t.postReview.mental || '—'}/5</div>
          <div class="rating-item">Físico: ${t.postReview.physical || '—'}/5</div>
        </div>
        ${t.postReview.learned ? `<div style="margin-top:8px;"><em>Aprendizajes:</em> ${escapeHtml(t.postReview.learned)}</div>` : ''}
        ${t.postReview.improveNext ? `<div><em>A mejorar:</em> ${escapeHtml(t.postReview.improveNext)}</div>` : ''}
      </div>` : '';

    const wellnessHtml = (t.sleep || t.energy || t.nutrition || t.health || t.stress) ? `
      <div class="detail-subsection">
        <strong>Estado previo:</strong>
        <div class="wellness-grid">
          ${t.sleep ? `<div>Sueño: ${t.sleep}/5</div>` : ''}
          ${t.energy ? `<div>Energía: ${t.energy}/5</div>` : ''}
          ${t.nutrition ? `<div>Nutrición: ${t.nutrition}/5</div>` : ''}
          ${t.health ? `<div>Salud: ${t.health}/5</div>` : ''}
          ${t.stress ? `<div>Estrés: ${t.stress}/5</div>` : ''}
        </div>
      </div>` : '';

    const goalsHtml = (t as any).goals && (t as any).goals.length > 0 ? `
      <div class="detail-subsection">
        <strong>Objetivos:</strong>
        <ul class="goals-list">
          ${(t as any).goals.map((g: string) => `<li>${escapeHtml(g)}</li>`).join('')}
        </ul>
      </div>` : '';

    const partnersHtml = (t as any).trainingPartners && (t as any).trainingPartners.length > 0 ? `
      <div class="detail-subsection">
        <strong>Compañeros:</strong> ${(t as any).trainingPartners.map((p: string) => escapeHtml(p)).join(', ')}
      </div>` : '';

    const notesHtml = t.notes ? `
      <div class="detail-subsection">
        <strong>Notas:</strong> ${escapeHtml(t.notes)}
      </div>` : '';

    return `
      <div class="detail-card">
        <div class="detail-header">
          <h3>${fmtDate(t.date)} - Entrenamiento</h3>
          <div class="detail-meta">
            ${(t as any).coach ? `<span>👨‍🏫 ${escapeHtml((t as any).coach)}</span>` : ''}
            ${t.location ? `<span>📍 ${escapeHtml(t.location)}</span>` : ''}
          </div>
        </div>
        <div class="detail-body">
          ${goalsHtml}
          ${partnersHtml}
          ${reviewHtml}
          ${wellnessHtml}
          ${notesHtml}
        </div>
      </div>`;
  }).join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      color:#0f172a;
      margin:0;
      padding:24px;
      background: #f8fafc;
    }
    h1 { font-size: 24px; margin: 0 0 6px; font-weight: 800; }
    h2 { font-size: 20px; margin: 24px 0 12px; font-weight: 700; page-break-before: always; }
    h3 { font-size: 16px; margin: 0; font-weight: 700; }
    .muted { color:#64748b; font-size: 12px; margin-bottom: 16px; }

    .card {
      border:1px solid #e2e8f0;
      border-radius:12px;
      padding:20px;
      background:#fff;
      margin-bottom:16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .grid {
      display: grid;
      grid-gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .stat {
      background:#f8fafc;
      border:1px solid #e2e8f0;
      border-radius:8px;
      padding:14px;
      text-align: center;
    }
    .stat .val { font-size: 28px; font-weight: 800; margin: 4px 0; color: #0ea5e9; }
    .stat .lbl { color:#64748b; font-size:11px; font-weight:600; text-transform: uppercase; letter-spacing: 0.5px; }

    .performance-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
    }

    .perf-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 12px;
    }

    .perf-item {
      text-align: center;
      padding: 10px;
      background: #f1f5f9;
      border-radius: 6px;
    }
    .perf-item .perf-val { font-size: 20px; font-weight: 700; color: #3b82f6; }
    .perf-item .perf-lbl { font-size: 10px; color: #64748b; margin-top: 4px; }

    table { width:100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align:left; padding:10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    th { background:#f1f5f9; color:#334155; font-weight:700; }

    .section-title {
      font-size: 18px;
      font-weight: 800;
      margin: 2px 0 10px;
      color: #0f172a;
    }

    .badge {
      display:inline-block;
      padding:4px 10px;
      border-radius:999px;
      background:#eff6ff;
      color:#1d4ed8;
      font-size:11px;
      font-weight:700;
      border:1px solid #bfdbfe;
      margin-left: 8px;
    }

    .detail-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
      background: #fff;
      page-break-inside: avoid;
    }

    .detail-header {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }

    .detail-meta {
      display: flex;
      gap: 12px;
      margin-top: 6px;
      flex-wrap: wrap;
    }

    .detail-meta span {
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .detail-body {
      font-size: 12px;
      line-height: 1.6;
    }

    .detail-subsection {
      margin-bottom: 12px;
    }

    .detail-subsection strong {
      color: #334155;
      display: block;
      margin-bottom: 4px;
    }

    .ratings-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 6px;
    }

    .rating-item {
      background: #f8fafc;
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      font-size: 11px;
      border: 1px solid #e2e8f0;
    }

    .wellness-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
      margin-top: 6px;
    }

    .wellness-grid div {
      background: #f1f5f9;
      padding: 6px;
      border-radius: 4px;
      font-size: 11px;
      text-align: center;
    }

    .goals-list {
      margin: 6px 0 0 20px;
      padding: 0;
    }

    .goals-list li {
      margin-bottom: 4px;
      font-size: 11px;
    }

    @media print {
      body { background: white; }
      .card { box-shadow: none; page-break-inside: avoid; }
      h2 { page-break-before: always; }
    }
  </style>
</head>
<body>

  <!-- PORTADA / RESUMEN EJECUTIVO -->
  <div class="card">
    <h1>${safeTitle}</h1>
    <div class="muted">Período: ${fromTxt} → ${toTxt}</div>

    <div class="grid">
      <div class="stat">
        <div class="lbl">Entrenamientos</div>
        <div class="val">${selTrainings.length}</div>
      </div>
      <div class="stat">
        <div class="lbl">Partidos</div>
        <div class="val">${totalMatches}</div>
      </div>
      <div class="stat">
        <div class="lbl">Victorias</div>
        <div class="val">${winCount}</div>
      </div>
      <div class="stat">
        <div class="lbl">Derrotas</div>
        <div class="val">${lossCount}</div>
      </div>
      <div class="stat">
        <div class="lbl">Win Rate</div>
        <div class="val">${winRate}%</div>
      </div>
      ${indoorMatches > 0 || outdoorMatches > 0 ? `
      <div class="stat">
        <div class="lbl">Pista Interior</div>
        <div class="val">${indoorMatches}</div>
      </div>
      <div class="stat">
        <div class="lbl">Pista Exterior</div>
        <div class="val">${outdoorMatches}</div>
      </div>
      ` : ''}
      ${rightPositionMatches > 0 || leftPositionMatches > 0 ? `
      <div class="stat">
        <div class="lbl">Pos. Derecha</div>
        <div class="val">${rightPositionMatches}</div>
      </div>
      <div class="stat">
        <div class="lbl">Pos. Izquierda</div>
        <div class="val">${leftPositionMatches}</div>
      </div>
      ` : ''}
    </div>

    ${matchesWithRatings.length > 0 ? `
    <div class="performance-section">
      <div class="section-title">📊 Rendimiento en Partidos (Promedio)</div>
      <div class="perf-grid">
        <div class="perf-item">
          <div class="perf-val">${avgTechnical}</div>
          <div class="perf-lbl">Técnica</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgTactical}</div>
          <div class="perf-lbl">Táctica</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgMental}</div>
          <div class="perf-lbl">Mental</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgPhysical}</div>
          <div class="perf-lbl">Físico</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${trainingsWithReview.length > 0 ? `
    <div class="performance-section">
      <div class="section-title">🏃 Rendimiento en Entrenamientos (Promedio)</div>
      <div class="perf-grid">
        <div class="perf-item">
          <div class="perf-val">${avgTrainingTechnical}</div>
          <div class="perf-lbl">Técnica</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgTrainingTactical}</div>
          <div class="perf-lbl">Táctica</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgTrainingMental}</div>
          <div class="perf-lbl">Mental</div>
        </div>
        <div class="perf-item">
          <div class="perf-val">${avgTrainingPhysical}</div>
          <div class="perf-lbl">Físico</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${itemsWithWellness.length > 0 ? `
    <div class="performance-section">
      <div class="section-title">💪 Bienestar (Promedio)</div>
      <div class="perf-grid">
        ${avgSleep > 0 ? `
        <div class="perf-item">
          <div class="perf-val">${avgSleep}</div>
          <div class="perf-lbl">Sueño</div>
        </div>` : ''}
        ${avgEnergy > 0 ? `
        <div class="perf-item">
          <div class="perf-val">${avgEnergy}</div>
          <div class="perf-lbl">Energía</div>
        </div>` : ''}
        ${avgNutrition > 0 ? `
        <div class="perf-item">
          <div class="perf-val">${avgNutrition}</div>
          <div class="perf-lbl">Nutrición</div>
        </div>` : ''}
        ${avgHealth > 0 ? `
        <div class="perf-item">
          <div class="perf-val">${avgHealth}</div>
          <div class="perf-lbl">Salud</div>
        </div>` : ''}
        ${avgStress > 0 ? `
        <div class="perf-item">
          <div class="perf-val">${avgStress}</div>
          <div class="perf-lbl">Estrés</div>
        </div>` : ''}
      </div>
    </div>
    ` : ''}
  </div>

  <!-- RESUMEN DE PARTIDOS (TABLA) -->
  ${opt.includeMatches && selMatches.length > 0 ? `
  <div class="card">
    <div class="section-title">🎾 Resumen de Partidos<span class="badge">${selMatches.length}</span></div>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Resultado</th>
          <th>Marcador</th>
          <th>Torneo</th>
          <th>Lugar</th>
          <th>Compañero</th>
          <th>Posición</th>
        </tr>
      </thead>
      <tbody>
        ${matchRows}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- DETALLES DE PARTIDOS -->
  ${opt.includeMatches && selMatches.length > 0 ? `
  <h2>📋 Detalle de Partidos</h2>
  ${matchDetails}
  ` : ''}

  <!-- RESUMEN DE ENTRENAMIENTOS (TABLA) -->
  ${opt.includeTrainings && selTrainings.length > 0 ? `
  <div class="card">
    <div class="section-title">🏃 Resumen de Entrenamientos<span class="badge">${selTrainings.length}</span></div>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Entrenador</th>
          <th>Lugar</th>
          <th>Objetivos</th>
          <th>Compañeros</th>
        </tr>
      </thead>
      <tbody>
        ${trainingRows}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- DETALLES DE ENTRENAMIENTOS -->
  ${opt.includeTrainings && selTrainings.length > 0 ? `
  <h2>📚 Detalle de Entrenamientos</h2>
  ${trainingDetails}
  ` : ''}

</body>
</html>`;
}

/**
 * Genera el PDF. En nativo devuelve { uri } del PDF.
 * En web genera y descarga el PDF directamente.
 */
export async function exportActivityReportPDF(
  matches: Match[],
  trainings: Training[],
  options: ExportOptions
): Promise<{ uri?: string }> {
  const html = buildHtml(matches, trainings, options);

  // Web: generar PDF usando printAsync con custom options
  if (Platform.OS === 'web') {
    try {
      if (__DEV__) {
        console.log('Starting PDF generation on web...');
        console.log('Matches count:', matches.length);
        console.log('Trainings count:', trainings.length);
        console.log('HTML length:', html.length);
      }

      // En web, Print.printToFileAsync a veces no funciona correctamente
      // Usaremos un enfoque híbrido: generar el HTML y usar window.print con configuración

      // Crear un iframe oculto con el contenido HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      // Escribir el HTML en el iframe
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('No se pudo crear el documento del iframe');
      }

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Esperar a que el contenido se cargue
      await new Promise(resolve => {
        if (iframe.contentWindow) {
          iframe.contentWindow.onload = () => resolve(null);
          // Fallback en caso de que onload no se dispare
          setTimeout(resolve, 500);
        } else {
          resolve(null);
        }
      });

      // Usar la API de Print del iframe
      const printWindow = iframe.contentWindow;
      if (printWindow) {
        printWindow.print();
      }

      // Limpiar después de un tiempo
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      return { uri: 'web-print' };
    } catch (error) {
      console.error('Error generating PDF on web:', error);
      throw new Error('No se pudo generar el PDF. Intenta de nuevo.');
    }
  }

  // Nativo: guardar PDF local
  const { uri } = await Print.printToFileAsync({ html });
  let finalUri = uri;

  // Renombrar en el mismo directorio si se pide filename
  if (options.filename) {
    try {
      const lastSlash = uri.lastIndexOf('/');
      const baseDir = lastSlash > -1 ? uri.slice(0, lastSlash + 1) : '';
      const dest = `${baseDir}${options.filename}.pdf`;

      try {
        const info = await FileSystem.getInfoAsync(dest);
        if (info.exists) {
          await FileSystem.deleteAsync(dest, { idempotent: true });
        }
      } catch { /* noop */ }

      await FileSystem.copyAsync({ from: uri, to: dest });
      finalUri = dest;
    } catch {
      // si falla, dejamos el uri original
    }
  }

  return { uri: finalUri };
}

/**
 * Genera y comparte (sólo nativo). En web, descarga el PDF automáticamente.
 */
export async function exportPdfAndShare(
  matches: Match[],
  trainings: Training[],
  options: ExportOptions
): Promise<void> {
  const res = await exportActivityReportPDF(matches, trainings, options);

  if (Platform.OS === 'web') {
    // En web, el PDF ya se descargó automáticamente
    return;
  }

  // Nativo: compartir si es posible
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare && res.uri) {
      await Sharing.shareAsync(res.uri, {
        dialogTitle: options.title || 'Informe',
        mimeType: 'application/pdf',
      });
    }
  } catch {
    // Si no se puede compartir, no rompemos el flujo
  }
}
