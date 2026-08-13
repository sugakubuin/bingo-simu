import { GRAND_CROSS, KIND_COUNT, expandKong, tileName } from "./tiles";
import { fullSetSize } from "./wall";
import type { SimInput } from "../types";

export function validateInput(input: SimInput): string[] {
  const errors: string[] = [];
  const k = input.kongs.length;
  if (k < 0 || k > 4) errors.push("槓子は 0–4 組です");
  const expected = 14 - 3 * k;
  if (input.concealed.length !== expected) {
    errors.push(`面前は ${expected} 枚必要です（いま ${input.concealed.length} 枚）`);
  }
  const counts = new Uint8Array(KIND_COUNT);
  for (const t of input.concealed) {
    if (t < 0 || t > 24) {
      errors.push("面前に使えない牌があります");
      continue;
    }
    counts[t]++;
  }
  let grandCross = 0;
  for (const t of input.kongs) {
    if (t === GRAND_CROSS) {
      grandCross++;
      if (input.mode !== "ultra") {
        errors.push("グランドクロスはウルトラビンゴのみです");
      }
      for (const tile of expandKong(t)) counts[tile]++;
      continue;
    }
    if (t < 0 || t > 24) {
      errors.push("槓子に使えない牌があります");
      continue;
    }
    counts[t] += 4;
  }
  if (grandCross > 1) errors.push("グランドクロスは 1 組までです");
  for (let i = 0; i <= 24; i++) {
    if (counts[i] > 4) {
      errors.push(`${tileName(i)} が ${counts[i]} 枚あります（最大 4）`);
    }
  }
  if (input.flowers < 0 || input.flowers > 4) {
    errors.push("花牌抜きは 0–4 枚です");
  }
  if (input.tons < 1 || input.tons > 30) {
    errors.push("残りトン数は 1–30 です");
  }
  if (input.guard < 0 || input.guard > 3) {
    errors.push("転落保証は 0–3 です");
  }
  const wallNeed = 2 * input.tons;
  const remain =
    fullSetSize(input.mode) - (14 + k) - input.flowers;
  if (wallNeed > remain) {
    errors.push("残り牌が足りず、指定トン数の山を作れません");
  }
  return errors;
}
