import type { CheckIn } from "@/lib/database.types";

export type TrendPoint = {
  label: string;
  date: string;
  score: number;
  mood: number;
  sleep: number;
  load: number;
};

export type WellbeingAnalytics = {
  points: TrendPoint[];
  average: number;
  current: number;
  delta: number;
  consistency: number;
  focus: string;
  status: string;
  explanation: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function makeSyntheticScore(dayIndex: number, baseDate: Date) {
  const wave = Math.sin((dayIndex + baseDate.getDate()) / 1.55) * 14;
  const weekdayBias = [58, 61, 66, 63, 70, 74, 69][baseDate.getDay() % 7];
  return clamp(Math.round(weekdayBias + wave), 42, 91);
}

function formatIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
}

export function getDemoCheckIns(): CheckIn[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const score = makeSyntheticScore(index, date);
    const mood = Math.max(1, Math.min(5, Math.round(score / 20)));
    const sleep = Math.max(1, Math.min(3, Math.round((score % 20) / 16) + 1));
    const load = Math.max(1, Math.min(3, Math.round(((100 - score) / 30) + 1)));

    return {
      id: `demo-${index}`,
      user_id: "demo-user-local",
      mood,
      sleep_quality: sleep,
      academic_load: load,
      support_signal: score,
      created_at: date.toISOString(),
    };
  });
}

function buildFallbackPoints(): TrendPoint[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const score = makeSyntheticScore(index, date);
    return {
      label: getDayLabel(date),
      date: formatIso(date),
      score,
      mood: Math.max(1, Math.min(5, Math.round(score / 20))),
      sleep: Math.max(1, Math.min(3, Math.round((score % 20) / 16) + 1)),
      load: Math.max(1, Math.min(3, Math.round(((100 - score) / 30) + 1))),
    };
  });
}

export function getWellbeingAnalytics(checkIns: CheckIn[] | null | undefined): WellbeingAnalytics {
  const source = [...(checkIns ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  if (source.length === 0) {
    const points = buildFallbackPoints();
    const average = Math.round(points.reduce((sum, point) => sum + point.score, 0) / points.length);
    const current = points[points.length - 1].score;
    const delta = current - points[0].score;
    const consistency = 80;
    const focus = delta >= 0 ? "Recovery trend is improving" : "A gentle dip is worth a check-in";
    const status = delta >= 0 ? "Steady progress" : "Needs care";
    return {
      points,
      average,
      current,
      delta,
      consistency,
      focus,
      status,
      explanation: "Using a stable demo baseline while your real check-in history is still syncing.",
    };
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const dayIndex = new Map<string, { total: number; count: number; mood: number; sleep: number; load: number }>();

  source.forEach((item) => {
    const createdAt = new Date(item.created_at);
    const dayKey = formatIso(createdAt);
    const entry = dayIndex.get(dayKey) ?? { total: 0, count: 0, mood: 0, sleep: 0, load: 0 };
    entry.total += item.support_signal;
    entry.count += 1;
    entry.mood += item.mood;
    entry.sleep += item.sleep_quality;
    entry.load += item.academic_load;
    dayIndex.set(dayKey, entry);
  });

  const baseline = Math.round(source.reduce((sum, item) => sum + item.support_signal, 0) / source.length);
  const points: TrendPoint[] = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - (6 - index));
    const dateKey = formatIso(date);
    const currentEntry = dayIndex.get(dateKey);
    const score = currentEntry ? Math.round(currentEntry.total / currentEntry.count) : undefined;
    const previousScore = points[index - 1]?.score ?? baseline;
    const computedScore = score ?? previousScore;
    const mood = currentEntry ? Math.round(currentEntry.mood / currentEntry.count) : 3;
    const sleep = currentEntry ? Math.round(currentEntry.sleep / currentEntry.count) : 2;
    const load = currentEntry ? Math.round(currentEntry.load / currentEntry.count) : 2;

    points.push({
      label: getDayLabel(date),
      date: dateKey,
      score: computedScore,
      mood: Math.max(1, Math.min(5, mood)),
      sleep: Math.max(1, Math.min(3, sleep)),
      load: Math.max(1, Math.min(3, load)),
    });
  }

  const average = Math.round(points.reduce((sum, point) => sum + point.score, 0) / points.length);
  const current = points[points.length - 1].score;
  const delta = current - points[0].score;
  const variance = Math.max(0, ...points.map((point) => Math.abs(point.score - average)));
  const consistency = Math.max(55, Math.min(95, 100 - Math.round(variance / 2.4)));
  const focus = delta >= 0 ? "Recovery trend is improving" : "Stress is trending upward";
  const status = delta >= 0 ? "Steady progress" : "Needs care";

  return {
    points,
    average,
    current,
    delta,
    consistency,
    focus,
    status,
    explanation: "Based on the last 7 days of your private check-ins.",
  };
}
