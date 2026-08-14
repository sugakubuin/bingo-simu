import { FLOWER, KIND_COUNT, MAN7, P7, S7, expandKong } from "./tiles";
import type { Mode } from "../types";

export function fullSetCounts(mode: Mode): Uint8Array {
  const counts = new Uint8Array(KIND_COUNT);
  if (mode === "ultra") {
    counts[MAN7] = 4;
    for (let k = 0; k <= 8; k++) counts[k] = 4;
    for (let k = 9; k <= 17; k++) counts[k] = 4;
  } else {
    for (let k = 0; k <= 8; k++) counts[k] = k === P7 ? 8 : 4;
    for (let k = 9; k <= 17; k++) counts[k] = k === S7 ? 8 : 4;
  }
  for (let k = 18; k <= 24; k++) counts[k] = 4;
  counts[FLOWER] = 4;
  return counts;
}

export function fullSetSize(mode: Mode): number {
  return mode === "ultra" ? 108 : 112;
}

export function remainingPool(
  mode: Mode,
  concealed: readonly number[],
  kongs: readonly number[],
  flowers: number,
  excluded: readonly number[] = [],
): Uint8Array {
  const counts = fullSetCounts(mode);
  for (const t of concealed) {
    if (counts[t] === 0) {
      throw new Error("手牌が山の構成を超えています");
    }
    counts[t]--;
  }
  for (const t of kongs) {
    for (const tile of expandKong(t)) {
      if (counts[tile] === 0) {
        throw new Error("槓子が山の構成を超えています");
      }
      counts[tile]--;
    }
  }
  if (counts[FLOWER] < flowers) {
    throw new Error("花牌の抜き枚数が山を超えています");
  }
  counts[FLOWER] -= flowers;
  for (const t of excluded) {
    if (counts[t] === 0) {
      throw new Error("除外牌が山の構成を超えています");
    }
    counts[t]--;
  }

  let size = 0;
  for (let k = 0; k < KIND_COUNT; k++) size += counts[k];
  const pool = new Uint8Array(size);
  let i = 0;
  for (let k = 0; k < KIND_COUNT; k++) {
    for (let n = 0; n < counts[k]; n++) pool[i++] = k;
  }
  return pool;
}

export function drawWall(
  pool: Uint8Array,
  n2: number,
  rng: () => number,
  dest: Uint8Array,
): void {
  dest.set(pool);
  const len = dest.length;
  const m = Math.min(n2, len);
  for (let i = 0; i < m; i++) {
    const j = i + Math.floor(rng() * (len - i));
    const tmp = dest[i];
    dest[i] = dest[j];
    dest[j] = tmp;
  }
}
