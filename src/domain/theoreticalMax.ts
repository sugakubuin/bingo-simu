import { FLOWER } from "./tiles";
import { buildNoriTable, handCounts } from "./nori";
import { initialState } from "./initialState";
import { remainingPool } from "./wall";
import type { Mode, SimInput } from "../types";

type TileNori = {
  kind: number;
  value: number;
  totsu: boolean;
};

export function isTotsukakuTile(
  kind: number,
  nori: Uint8Array,
  mode: Mode,
): boolean {
  return nori[kind] >= 6 && !(mode === "super" && kind === FLOWER);
}

function info(kind: number, nori: Uint8Array, mode: Mode): TileNori {
  return {
    kind,
    value: nori[kind] ?? 0,
    totsu: isTotsukakuTile(kind, nori, mode),
  };
}

function byValue(a: TileNori, b: TileNori): number {
  return b.value - a.value || Number(b.totsu) - Number(a.totsu);
}

function takeForWall(
  pool: TileNori[],
  count: number,
  minTotsu: number,
): TileNori[] {
  if (count <= 0) return [];
  const sorted = [...pool].sort(byValue);
  const totsu = sorted.filter((t) => t.totsu);
  const others = sorted.filter((t) => !t.totsu);
  const nTotsu = Math.min(Math.max(0, minTotsu), totsu.length, count);
  const taken = totsu.slice(0, nTotsu);
  const leftover = [...totsu.slice(nTotsu), ...others].sort(byValue);
  return taken.concat(leftover.slice(0, count - taken.length));
}

function takeContributing(
  wall: TileNori[],
  count: number,
  minTotsu: number,
): TileNori[] {
  return takeForWall(wall, Math.min(count, wall.length), minTotsu);
}

export function theoreticalMaxNori(
  nori: Uint8Array,
  pool: Uint8Array,
  forced: ArrayLike<number>,
  tons: number,
  startKakuhen: boolean,
  start16R: boolean,
  mode: Mode,
): number {
  const n2 = 2 * tons;
  const poolTiles = Array.from(pool, (k) => info(k, nori, mode));
  const forcedTiles = Array.from(forced, (k) => info(k, nori, mode));
  const totsuAvailable =
    poolTiles.filter((t) => t.totsu).length +
    forcedTiles.filter((t) => t.totsu).length;

  let enterKakuhen = startKakuhen;
  let enter16R = start16R;
  if (!enterKakuhen && tons >= 2 && totsuAvailable >= 1) enterKakuhen = true;
  if (!enter16R && enterKakuhen) {
    if (startKakuhen && totsuAvailable >= 1) enter16R = true;
    if (!startKakuhen && totsuAvailable >= 2) enter16R = true;
  }

  const contributingCount = startKakuhen
    ? n2
    : enterKakuhen
      ? n2 - 1
      : tons;

  const minTotsu = enter16R
    ? startKakuhen
      ? 1
      : 2
    : enterKakuhen && !startKakuhen
      ? 1
      : 0;

  const fromPool = takeForWall(
    poolTiles,
    n2 - forcedTiles.length,
    Math.max(0, minTotsu - forcedTiles.filter((t) => t.totsu).length),
  );
  const wall = forcedTiles.concat(fromPool);
  const contributing = takeContributing(wall, contributingCount, minTotsu);
  let sum = 0;
  for (const t of contributing) sum += t.value;
  return enter16R ? sum * 2 : sum;
}

export function theoreticalMaxFromInput(input: SimInput): number {
  const hand = handCounts(input.concealed, input.kongs);
  const nori = buildNoriTable(hand, input.flowers);
  const initial = initialState(hand, input.winType);
  const pool = remainingPool(
    input.mode,
    input.concealed,
    input.kongs,
    input.flowers,
    input.excluded,
    input.forced,
  );
  return theoreticalMaxNori(
    nori,
    pool,
    input.forced ?? [],
    input.tons,
    initial.kakuhen,
    initial.is16R,
    input.mode,
  );
}
