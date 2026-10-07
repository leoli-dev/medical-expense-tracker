export interface DateRange {
  startDate: string;
  endDate: string;
}
export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function yearRange(year: number): DateRange {
  const value = String(year).padStart(4, "0");
  return { startDate: `${value}-01-01`, endDate: `${value}-12-31` };
}
export function rangeDays(range: DateRange): number {
  return (
    Math.round(
      (Date.parse(range.endDate) - Date.parse(range.startDate)) / 86400000,
    ) + 1
  );
}
export function rangeQuery(range: DateRange): string {
  return new URLSearchParams({
    startDate: range.startDate,
    endDate: range.endDate,
  }).toString();
}
