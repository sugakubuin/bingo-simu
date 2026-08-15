import { P7, S7 } from "./tiles";
import type { InitialState, WinType } from "../types";

export function initialState(hand: Uint8Array, winType: WinType): InitialState {
  const sevenSevenSeven = hand[P7] >= 3 && hand[S7] >= 3;
  const seven = hand[P7] >= 3 || hand[S7] >= 3;
  if (sevenSevenSeven || (seven && winType === "riichiYakuman")) {
    return { kakuhen: true, is16R: true, label: "16R" };
  }
  if (seven || winType === "riichiYakuman") {
    return { kakuhen: true, is16R: false, label: "確変" };
  }
  return { kakuhen: false, is16R: false, label: "通常" };
}
