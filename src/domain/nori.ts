import { FLOWER, KIND_COUNT, MAN7, P7, S7, expandKong, nextOf, prevOf } from "./tiles";

export function handCounts(
  concealed: readonly number[],
  kongs: readonly number[],
): Uint8Array {
  const hand = new Uint8Array(KIND_COUNT);
  for (const t of concealed) hand[t]++;
  for (const t of kongs) {
    for (const tile of expandKong(t)) hand[tile]++;
  }
  return hand;
}

export function buildNoriTable(hand: Uint8Array, flowers: number): Uint8Array {
  const nori = new Uint8Array(KIND_COUNT);
  for (let k = 0; k <= 24; k++) {
    nori[k] = hand[prevOf(k)] + hand[k] + hand[nextOf(k)];
  }
  nori[FLOWER] = 3 * flowers;
  nori[MAN7] = Math.max(nori[P7], nori[S7]);
  return nori;
}
