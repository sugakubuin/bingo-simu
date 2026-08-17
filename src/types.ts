export type Mode = "ultra" | "super";

export type WinType = "normal" | "yakumanNoRiichi" | "riichiYakuman";

export type SimInput = {
  mode: Mode;
  winType: WinType;
  concealed: number[];
  kongs: number[];
  flowers: number;
  tons: number;
  guard: number;
  excluded: number[];
  forced: number[];
};

export type InitialState = {
  kakuhen: boolean;
  is16R: boolean;
  label: "通常" | "確変" | "16R";
};

export type TrialResult = {
  total: number;
  tonUsed: number;
  everKakuhen: boolean;
  everTotsukaku: boolean;
  is16R: boolean;
};

export type SimStats = {
  trials: number;
  mean: number;
  median: number;
  modeValue: number;
  stddev: number;
  zeroRate: number;
  kakuhenRate: number;
  totsukakuRate: number;
  r16Rate: number;
  meanTons: number;
  continueRate: number;
  finishRate: number;
  max: number;
  freq: number[];
  nori: number[];
  initial: InitialState;
};
