export function getOneDayWindowPagination(date: Date, offset: number) {
  const startOfDay = new Date(date);
  startOfDay.setUTCDate(date.getUTCDate() - 1 - offset);
  const endOfDay = new Date(date);
  endOfDay.setUTCDate(date.getUTCDate() - offset);

  return { startOfDay, endOfDay };
}
