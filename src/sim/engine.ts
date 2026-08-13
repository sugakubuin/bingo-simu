import { FLOWER } from "../domain/tiles";
import type { Mode, TrialResult } from "../types";

export function runTrial(
  wall: Uint8Array,
  nori: Uint8Array,
  n: number,
  startKakuhen: boolean,
  start16R: boolean,
  guard: number,
  mode: Mode,
): TrialResult {
  let total = 0;
  let tonUsed = 0;
  let kakuhen = startKakuhen;
  let is16R = start16R;
  let pendingKakuhen = false;
  let everKakuhen = startKakuhen;
  let everTotsukaku = false;
  const superMode = mode === "super";

  for (let i = 1; i <= n; i++) {
    if (pendingKakuhen) {
      kakuhen = true;
      pendingKakuhen = false;
      everKakuhen = true;
    }

    tonUsed = i;
    const upper = wall[2 * (i - 1)];
    const cU = nori[upper];
    let cL = 0;
    let lower = 0;
    if (kakuhen) {
      lower = wall[2 * (i - 1) + 1];
      cL = nori[lower];
    }
    total += cU + cL;

    const checkTotsukaku = (tile: number, c: number) => {
      if (c >= 6 && !(superMode && tile === FLOWER)) {
        everTotsukaku = true;
        if (kakuhen) is16R = true;
        else pendingKakuhen = true;
      }
    };
    checkTotsukaku(upper, cU);
    if (kakuhen) checkTotsukaku(lower, cL);

    if (cU + cL === 0) {
      if (guard > 0) {
        guard -= 1;
        continue;
      }
      break;
    }
  }

  if (is16R) total *= 2;
  return { total, tonUsed, everKakuhen, everTotsukaku, is16R };
}
