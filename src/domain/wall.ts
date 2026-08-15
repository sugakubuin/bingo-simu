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
  forced: readonly number[] = [],
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
  for (const t of forced) {
    if (counts[t] === 0) {
      throw new Error("確定牌が山の構成を超えています");
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
  forced: ArrayLike<number> = [],
): void {
  const g = forced.length;
  const need = n2 - g;
  if (need < 0) {
    throw new Error("確定牌が山の長さを超えています");
  }
  if (need > pool.length) {
    throw new Error("残り牌が足りず、指定トン数の山を作れません");
  }

  const work = new Uint8Array(pool);
  for (let i = 0; i < need; i++) {
    const j = i + Math.floor(rng() * (work.length - i));
    const tmp = work[i];
    work[i] = work[j];
    work[j] = tmp;
  }
  dest.set(work.subarray(0, need), 0);
  for (let i = 0; i < g; i++) dest[need + i] = forced[i];
  for (let i = 0; i < n2; i++) {
    const j = i + Math.floor(rng() * (n2 - i));
    const tmp = dest[i];
    dest[i] = dest[j];
    dest[j] = tmp;
  }
}
