export function calculateSupportSignal(
  mood: number,
  sleepQuality: number,
  academicLoad: number,
): number {
  return Math.max(
    5,
    Math.min(95, 65 - mood * 10 + (3 - sleepQuality) * 12 + academicLoad * 10),
  );
}
