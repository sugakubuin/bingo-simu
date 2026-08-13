import { buildNoriTable, handCounts } from "../domain/nori";
import { initialState } from "../domain/initialState";
import { drawWall, remainingPool } from "../domain/wall";
import { mulberry32 } from "../domain/rng";
import { runTrial } from "./engine";
import { freqFromTotals } from "./histogram";
import type { SimInput, SimStats } from "../types";

export const TRIALS = 100_000;
const CDF_POINTS = [1, 3, 5, 10, 20, 30, 50];

export type ProgressFn = (done: number, total: number) => void;

export function runSimulation(
  input: SimInput,
  options: { trials?: number; seed?: number; onProgress?: ProgressFn } = {},
): SimStats {
  const trials = options.trials ?? TRIALS;
  const rng = mulberry32(options.seed ?? (Math.random() * 0xffffffff) >>> 0);
  const hand = handCounts(input.concealed, input.kongs);
  const nori = buildNoriTable(hand, input.flowers);
  const initial = initialState(hand, input.winType);
  const pool = remainingPool(input.mode, input.concealed, input.kongs, input.flowers);
  const n2 = 2 * input.tons;
  const buf = new Uint8Array(pool.length);

  const totals = new Uint16Array(trials);
  let sum = 0;
  let sumSq = 0;
  let zeros = 0;
  let kakuhenN = 0;
  let totsuN = 0;
  let r16N = 0;
  let tonSum = 0;

  for (let t = 0; t < trials; t++) {
    drawWall(pool, n2, rng, buf);
    const r = runTrial(
      buf,
      nori,
      input.tons,
      initial.kakuhen,
      initial.is16R,
      input.guard,
      input.mode,
    );
    totals[t] = r.total;
    sum += r.total;
    sumSq += r.total * r.total;
    if (r.total === 0) zeros++;
    if (r.everKakuhen) kakuhenN++;
    if (r.everTotsukaku) totsuN++;
    if (r.is16R) r16N++;
    tonSum += r.tonUsed;
    if (options.onProgress && (t + 1) % 5000 === 0) {
      options.onProgress(t + 1, trials);
    }
  }
  options.onProgress?.(trials, trials);

  const sorted = totals.slice();
  sorted.sort();
  const mid = trials >> 1;
  const median =
    trials % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const mean = sum / trials;
  const variance = sumSq / trials - mean * mean;
  const stddev = Math.sqrt(Math.max(0, variance));

  const cdf = CDF_POINTS.map((threshold) => {
    let c = 0;
    for (let i = 0; i < trials; i++) if (sorted[i] >= threshold) c++;
    return { n: threshold, rate: c / trials };
  });

  return {
    trials,
    mean,
    median,
    stddev,
    zeroRate: zeros / trials,
    kakuhenRate: kakuhenN / trials,
    totsukakuRate: totsuN / trials,
    r16Rate: r16N / trials,
    meanTons: tonSum / trials,
    freq: freqFromTotals(totals),
    cdf,
    nori: Array.from(nori),
    initial,
  };
}
