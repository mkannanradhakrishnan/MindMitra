/**
 * MindMitra — Wellbeing Analytics & Calculation Engine
 * Replicates the deterministic support signal calculation and 7-day trend analytics.
 */

(function () {
  /**
   * Deterministic Wellbeing Support Signal calculation
   * mood: 0 (Rough) to 4 (Great)
   * sleepQuality: 1 (Poor) to 3 (Restful)
   * academicLoad: 1 (Light) to 3 (Heavy)
   */
  function calculateSupportSignal(mood, sleepQuality, academicLoad) {
    const raw = 65 - mood * 10 + (3 - sleepQuality) * 12 + academicLoad * 10;
    return Math.max(5, Math.min(95, raw));
  }

  function formatIso(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDayLabel(date) {
    try {
      return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
    } catch (e) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    }
  }

  function getWellbeingAnalytics(checkIns) {
    const source = [...(checkIns || [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const dayIndex = new Map();
    source.forEach((item) => {
      const createdAt = new Date(item.created_at);
      const dayKey = formatIso(createdAt);
      const entry = dayIndex.get(dayKey) || { total: 0, count: 0, mood: 0, sleep: 0, load: 0 };
      entry.total += item.support_signal;
      entry.count += 1;
      entry.mood += item.mood;
      entry.sleep += item.sleep_quality;
      entry.load += item.academic_load;
      dayIndex.set(dayKey, entry);
    });

    const baseline = source.length > 0
      ? Math.round(source.reduce((sum, item) => sum + item.support_signal, 0) / source.length)
      : 65;

    const points = [];
    for (let index = 0; index < 7; index++) {
      const date = new Date(end);
      date.setDate(end.getDate() - (6 - index));
      const dateKey = formatIso(date);
      const currentEntry = dayIndex.get(dateKey);

      const score = currentEntry ? Math.round(currentEntry.total / currentEntry.count) : undefined;
      const previousScore = points[index - 1]?.score ?? baseline;
      const computedScore = score ?? previousScore;
      const mood = currentEntry ? Math.round(currentEntry.mood / currentEntry.count) : 2;
      const sleep = currentEntry ? Math.round(currentEntry.sleep / currentEntry.count) : 2;
      const load = currentEntry ? Math.round(currentEntry.load / currentEntry.count) : 2;

      points.push({
        label: getDayLabel(date),
        date: dateKey,
        score: computedScore,
        mood: Math.max(0, Math.min(4, mood)),
        sleep: Math.max(1, Math.min(3, sleep)),
        load: Math.max(1, Math.min(3, load)),
      });
    }

    const average = Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length);
    const current = points[points.length - 1].score;
    const delta = current - points[0].score;
    const variance = Math.max(0, ...points.map((p) => Math.abs(p.score - average)));
    const consistency = Math.max(55, Math.min(95, 100 - Math.round(variance / 2.4)));
    const focus = delta >= 0 ? 'Recovery trend is improving' : 'Stress is trending upward';
    const status = delta >= 0 ? 'Steady progress' : 'Needs care';

    return {
      points,
      average,
      current,
      delta,
      consistency,
      focus,
      status,
      explanation: 'Based on the last 7 days of your private check-ins.',
    };
  }

  function buildTrendPath(points, width = 520, height = 180) {
    if (!points || points.length === 0) return '';
    const stepX = (width - 40) / Math.max(1, points.length - 1);

    return points
      .map((point, index) => {
        const x = 20 + index * stepX;
        // Scale scores between 30 and 100
        const y = height - 20 - ((point.score - 30) / 70) * (height - 50);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  function buildAreaPath(points, width = 520, height = 180) {
    if (!points || points.length === 0) return '';
    const line = buildTrendPath(points, width, height);
    if (!line) return '';

    const stepX = (width - 40) / Math.max(1, points.length - 1);
    const xFirst = 20;
    const xLast = 20 + (points.length - 1) * stepX;
    const yBottom = height - 20;

    return `${line} L ${xLast.toFixed(1)} ${yBottom} L ${xFirst.toFixed(1)} ${yBottom} Z`;
  }

  function getSignalCategory(score) {
    if (score < 50) return { label: 'Optimal / Light Load', color: '#6fb38b', desc: 'Your reported load and mood are in a healthy, manageable range.' };
    if (score <= 75) return { label: 'Moderate Load', color: '#f59e0b', desc: 'Slight stress or fatigue detected. Taking tiny 2-min breaks can help.' };
    return { label: 'High Pressure', color: '#ff8066', desc: 'Noticeable pressure and tiredness. Consider connecting with a peer or counsellor.' };
  }

  window.MindMitraWellbeing = {
    calculateSupportSignal,
    getWellbeingAnalytics,
    buildTrendPath,
    buildAreaPath,
    getSignalCategory,
  };
})();
