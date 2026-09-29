export const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];
export const clock = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, '0')}`;
export type PlanDay = { day: number; pages: number; from: number; to: number };
export function readingPlan(
  total: number,
  current: number,
  mode: 'pages' | 'days',
  amount: number,
): PlanDay[] {
  if (
    !Number.isInteger(total) ||
    !Number.isInteger(current) ||
    !Number.isInteger(amount) ||
    total < 1 ||
    current < 0 ||
    current >= total ||
    amount < 1 ||
    total > 100000 ||
    amount > 10000
  ) {
    return [];
  }
  const remaining = total - current;
  const days =
    mode === 'days'
      ? Math.min(amount, remaining)
      : Math.ceil(remaining / amount);
  let cursor = current;
  return Array.from({ length: days }, (_, index) => {
    const pages =
      mode === 'days'
        ? Math.floor(remaining / days) + (index < remaining % days ? 1 : 0)
        : Math.min(amount, total - cursor);
    const from = cursor + 1;
    cursor += pages;
    return { day: index + 1, pages, from, to: cursor };
  });
}
export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
