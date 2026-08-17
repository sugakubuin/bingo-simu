import { describe, expect, it } from "vitest";
import { FLOWER, MAN7, P7 } from "../domain/tiles";
import { parseHand } from "../domain/parse";
import { buildNoriTable, handCounts } from "../domain/nori";
import { initialState } from "../domain/initialState";
import { runTrial } from "./engine";
import { runSimulation } from "./stats";
import { FREQ_CAP, freqFromTotals, modeFromTotals, sliceFreq, survivalFromFreq, tScore } from "./histogram";

function wallOf(kinds: number[]): Uint8Array {
  return Uint8Array.from(kinds);
}

describe("1 試行", () => {
  it("0 枚のトンで即終了", () => {
    const hand = handCounts(parseHand("11112222333344p"), []);
    const nori = buildNoriTable(hand, 0);
    expect(nori[17]).toBe(0);
    const r = runTrial(wallOf([17, 17, 17, 17]), nori, 2, false, false, 0, "ultra");
    expect(r.total).toBe(0);
    expect(r.tonUsed).toBe(1);
    expect(r.everKakuhen).toBe(false);
  });

  it("非確変では下段をめくらない", () => {
    const hand = handCounts(parseHand("666777888p11122s"), []);
    const nori = buildNoriTable(hand, 0);
    expect(nori[6]).toBe(9);
    const r = runTrial(wallOf([6, 6]), nori, 1, false, false, 0, "ultra");
    expect(r.total).toBe(9);
    expect(r.everTotsukaku).toBe(true);
    expect(r.everKakuhen).toBe(false);
    expect(r.is16R).toBe(false);
  });

  it("突確は次のトンから確変", () => {
    const hand = handCounts(parseHand("666777888p11122s"), []);
    const nori = buildNoriTable(hand, 0);
    const r = runTrial(
      wallOf([6, 13, 13, 13]),
      nori,
      2,
      false,
      false,
      0,
      "ultra",
    );
    expect(r.everTotsukaku).toBe(true);
    expect(r.everKakuhen).toBe(true);
    expect(r.is16R).toBe(false);
    expect(r.tonUsed).toBe(2);
    expect(r.total).toBe(9);
  });

  it("確変中の突確は 16R", () => {
    const hand = handCounts(parseHand("666777888p11122s"), []);
    const nori = buildNoriTable(hand, 0);
    const r = runTrial(wallOf([6, 13]), nori, 1, true, false, 0, "ultra");
    expect(r.everTotsukaku).toBe(true);
    expect(r.is16R).toBe(true);
    expect(r.total).toBe(18);
  });

  it("スーパーの花牌は 6 枚以上でも突確しない", () => {
    const nori = buildNoriTable(new Uint8Array(27), 2);
    expect(nori[FLOWER]).toBe(6);
    const r = runTrial(wallOf([FLOWER, 0]), nori, 1, false, false, 0, "super");
    expect(r.total).toBe(6);
    expect(r.everTotsukaku).toBe(false);
    expect(r.everKakuhen).toBe(false);
  });

  it("ウルトラの花牌は突確する", () => {
    const nori = buildNoriTable(new Uint8Array(27), 2);
    const r = runTrial(wallOf([FLOWER, 0]), nori, 1, false, false, 0, "ultra");
    expect(r.everTotsukaku).toBe(true);
    expect(r.total).toBe(6);
  });

  it("16R は終了時に 2 倍", () => {
    const hand = handCounts(parseHand("111222333p11122s"), []);
    const nori = buildNoriTable(hand, 0);
    const r = runTrial(wallOf([0, 13]), nori, 1, true, true, 0, "ultra");
    expect(nori[0]).toBe(6);
    expect(r.total).toBe(12);
  });

  it("転落保証は 0 枚トンを連続スキップできる", () => {
    const nori = buildNoriTable(new Uint8Array(27), 0);
    const r = runTrial(
      wallOf([0, 0, 0, 0, 0, 0]),
      nori,
      5,
      false,
      false,
      2,
      "ultra",
    );
    expect(r.tonUsed).toBe(3);
    expect(r.total).toBe(0);
  });

  it("7m は大きい方ののりを使う", () => {
    const hand = handCounts(parseHand("667788p11112233s"), []);
    const nori = buildNoriTable(hand, 0);
    expect(nori[P7]).toBe(6);
    expect(nori[MAN7]).toBe(6);
    const r = runTrial(wallOf([MAN7]), nori, 1, false, false, 0, "ultra");
    expect(r.total).toBe(6);
    expect(r.everTotsukaku).toBe(true);
  });

  it("上下合計 6 では突確しない", () => {
    const hand = handCounts(parseHand("111222p111222s東東"), []);
    const nori = buildNoriTable(hand, 0);
    expect(nori[0]).toBe(6);
    expect(nori[2]).toBe(3);
    expect(nori[11]).toBe(3);
    const r = runTrial(wallOf([2, 11]), nori, 1, true, false, 0, "ultra");
    expect(r.total).toBe(6);
    expect(r.everTotsukaku).toBe(false);
    expect(r.is16R).toBe(false);
  });
});

describe("シミュレーション集計", () => {
  it("固定シードで再現する", () => {
    const input = {
      mode: "ultra" as const,
      winType: "normal" as const,
      concealed: parseHand("777888p777888s東東"),
      kongs: [] as number[],
      flowers: 0,
      tons: 8,
      guard: 0,
      excluded: [] as number[],
      forced: [] as number[],
    };
    const a = runSimulation(input, { trials: 2000, seed: 1 });
    const b = runSimulation(input, { trials: 2000, seed: 1 });
    expect(a.mean).toBe(b.mean);
    expect(a.median).toBe(b.median);
    expect(a.initial.label).toBe("16R");
    expect(a.mean).toBeGreaterThan(0);
  });

  it("初期 16R の到達率は 1", () => {
    const stats = runSimulation(
      {
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777888p777888s東東"),
        kongs: [],
        flowers: 0,
        tons: 5,
        guard: 0,
        excluded: [],
        forced: [],
      },
      { trials: 500, seed: 42 },
    );
    expect(stats.r16Rate).toBe(1);
    expect(stats.kakuhenRate).toBe(1);
    expect(stats.freq).toHaveLength(401);
    expect(stats.freq.reduce((a, b) => a + b, 0)).toBe(500);
    expect(stats.finishRate).toBeGreaterThanOrEqual(0);
    expect(stats.finishRate).toBeLessThanOrEqual(1);
    expect(Number.isInteger(stats.modeValue)).toBe(true);
    expect(Number.isInteger(stats.max)).toBe(true);
    expect(stats.max).toBe(108);
    expect(stats.max).toBeGreaterThanOrEqual(stats.modeValue);
  });

  it("リーチ役満の 777 は初期 16R", () => {
    const stats = runSimulation(
      {
        mode: "ultra",
        winType: "riichiYakuman",
        concealed: parseHand("777888p111222s東東"),
        kongs: [],
        flowers: 0,
        tons: 5,
        guard: 0,
        excluded: [],
        forced: [],
      },
      { trials: 200, seed: 7 },
    );
    expect(stats.initial.label).toBe("16R");
    expect(stats.r16Rate).toBe(1);
  });
});

describe("分布ビン", () => {
  it("400 以上を最後のビンにまとめる", () => {
    const freq = freqFromTotals([0, 49, 50, 400, 401]);
    expect(freq).toHaveLength(FREQ_CAP + 1);
    expect(freq[0]).toBe(1);
    expect(freq[49]).toBe(1);
    expect(freq[50]).toBe(1);
    expect(freq[400]).toBe(2);
  });

  it("表示範囲より大きい度数を overflow に足す", () => {
    const freq = freqFromTotals([0, 49, 50, 100, 400]);
    const sliced = sliceFreq(freq, 50);
    expect(sliced).toHaveLength(51);
    expect(sliced[0]).toEqual({ label: "0", count: 1 });
    expect(sliced[49]).toEqual({ label: "49", count: 1 });
    expect(sliced[50]).toEqual({ label: "50+", count: 3 });
  });

  it("最頻値は最多の値、同数なら小さい方", () => {
    expect(modeFromTotals([1, 2, 2, 3, 3])).toBe(2);
    expect(modeFromTotals([0, 0, 0, 5])).toBe(0);
  });

  it("累積（以上）は右からの合計", () => {
    const freq = freqFromTotals([0, 0, 2, 5, 5]);
    const s = survivalFromFreq(freq);
    expect(s[0]).toBe(5);
    expect(s[2]).toBe(3);
    expect(s[5]).toBe(2);
    expect(s[6]).toBe(0);
  });

  it("偏差値は平均で 50", () => {
    expect(tScore(10, 10, 4)).toBe(50);
    expect(tScore(14, 10, 4)).toBe(60);
    expect(tScore(6, 10, 0)).toBe(50);
  });
});
