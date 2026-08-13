export const FREQ_CAP = 400;
export const HIST_RANGES = [50, 100, 200, 400] as const;
export type HistRange = (typeof HIST_RANGES)[number];

export function freqFromTotals(totals: ArrayLike<number>): number[] {
  const freq = new Array<number>(FREQ_CAP + 1).fill(0);
  for (let i = 0; i < totals.length; i++) {
    const v = totals[i];
    if (v >= FREQ_CAP) freq[FREQ_CAP]++;
    else freq[v]++;
  }
  return freq;
}

export function sliceFreq(
  freq: number[],
  range: HistRange,
): { label: string; count: number }[] {
  const data: { label: string; count: number }[] = [];
  for (let i = 0; i < range; i++) {
    data.push({ label: String(i), count: freq[i] ?? 0 });
  }
  let overflow = 0;
  for (let i = range; i < freq.length; i++) overflow += freq[i] ?? 0;
  data.push({ label: `${range}+`, count: overflow });
  return data;
}

export function modeFromTotals(totals: ArrayLike<number>): number {
  const n = totals.length;
  if (n === 0) return 0;
  const counts = new Map<number, number>();
  let best = totals[0];
  let bestN = 0;
  for (let i = 0; i < n; i++) {
    const v = totals[i];
    const c = (counts.get(v) ?? 0) + 1;
    counts.set(v, c);
    if (c > bestN || (c === bestN && v < best)) {
      bestN = c;
      best = v;
    }
  }
  return best;
}
