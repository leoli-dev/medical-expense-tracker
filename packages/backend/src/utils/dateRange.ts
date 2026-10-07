function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  if (value.startsWith("0000-")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function parseExpenseRange(query: Record<string, unknown>) {
  if (query.startDate !== undefined || query.endDate !== undefined) {
    if (
      !validDate(query.startDate) ||
      !validDate(query.endDate) ||
      query.startDate > query.endDate
    )
      return null;
    return { startDate: query.startDate, endDate: query.endDate };
  }
  const year =
    query.year === undefined ? String(new Date().getFullYear()) : query.year;
  if (typeof year !== "string" || !/^\d{4}$/.test(year) || Number(year) < 1)
    return null;
  return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
}
