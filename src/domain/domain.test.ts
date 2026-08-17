import { describe, expect, it } from "vitest";
import { FLOWER, GRAND_CROSS, MAN7, P7, S7, nextOf, prevOf, tileName } from "./tiles";
import { parseHand, formatHand, ParseError } from "./parse";
import { buildNoriTable, handCounts } from "./nori";
import { initialState } from "./initialState";
import { fullSetCounts, fullSetSize, remainingPool, drawWall } from "./wall";
import { validateInput } from "./validate";
import { theoreticalMaxFromInput } from "./theoreticalMax";

describe("循環", () => {
  it("筒子は 9p → 1p", () => {
    expect(prevOf(0)).toBe(8);
    expect(nextOf(8)).toBe(0);
    expect(nextOf(0)).toBe(1);
  });

  it("索子は 9s → 1s", () => {
    expect(prevOf(9)).toBe(17);
    expect(nextOf(17)).toBe(9);
  });

  it("風牌は 北 → 東", () => {
    expect(nextOf(18)).toBe(19);
    expect(nextOf(21)).toBe(18);
    expect(prevOf(18)).toBe(21);
  });

  it("三元牌は 中 → 白", () => {
    expect(nextOf(22)).toBe(23);
    expect(nextOf(24)).toBe(22);
    expect(prevOf(22)).toBe(24);
  });
});

describe("パース", () => {
  it("仕様の例を読む", () => {
    const tiles = parseHand("東東東23456p7765s");
    expect(tiles).toEqual([18, 18, 18, 1, 2, 3, 4, 5, 15, 15, 14, 13]);
  });

  it("1z–7z を字牌として読む", () => {
    expect(parseHand("1234567z")).toEqual([18, 19, 20, 21, 22, 23, 24]);
  });

  it("萬子を拒否する", () => {
    expect(() => parseHand("123m")).toThrow(ParseError);
  });

  it("format は psz", () => {
    expect(formatHand(parseHand("東東東23456p7765s"))).toBe("23456p5677s111z");
  });

  it("format と parse が往復する", () => {
    const src = "23456p5677s111z";
    const tiles = parseHand(src);
    expect(formatHand(tiles)).toBe(src);
    expect(parseHand(formatHand(tiles))).toEqual(
      [...tiles].sort((a, b) => a - b),
    );
  });
});

describe("のりテーブル", () => {
  it("1p はめくりで 9p+1p+2p", () => {
    const hand = new Uint8Array(27);
    hand[8] = 2;
    hand[0] = 1;
    hand[1] = 3;
    const nori = buildNoriTable(hand, 0);
    expect(nori[0]).toBe(6);
  });

  it("9s は 8s+9s+1s", () => {
    const hand = new Uint8Array(27);
    hand[16] = 1;
    hand[17] = 2;
    hand[9] = 1;
    expect(buildNoriTable(hand, 0)[17]).toBe(4);
  });

  it("西は 南+西+北", () => {
    const hand = new Uint8Array(27);
    hand[19] = 1;
    hand[20] = 2;
    hand[21] = 1;
    expect(buildNoriTable(hand, 0)[20]).toBe(4);
  });

  it("白は三元すべて", () => {
    const hand = new Uint8Array(27);
    hand[22] = 2;
    hand[23] = 1;
    hand[24] = 1;
    expect(buildNoriTable(hand, 0)[22]).toBe(4);
  });

  it("花牌は 3f", () => {
    expect(buildNoriTable(new Uint8Array(27), 0)[FLOWER]).toBe(0);
    expect(buildNoriTable(new Uint8Array(27), 2)[FLOWER]).toBe(6);
    expect(buildNoriTable(new Uint8Array(27), 4)[FLOWER]).toBe(12);
  });

  it("7m は 7p / 7s の大きい方", () => {
    const hand = new Uint8Array(27);
    hand[5] = 2;
    hand[6] = 2;
    hand[7] = 1;
    hand[14] = 1;
    hand[15] = 1;
    hand[16] = 1;
    const nori = buildNoriTable(hand, 0);
    expect(nori[P7]).toBe(5);
    expect(nori[S7]).toBe(3);
    expect(nori[MAN7]).toBe(5);
  });

  it("槓子は 4 枚として数える", () => {
    const hand = handCounts([0, 0], [1]);
    expect(hand[0]).toBe(2);
    expect(hand[1]).toBe(4);
  });

  it("グランドクロスは東南西北を 1 枚ずつ", () => {
    const hand = handCounts([], [GRAND_CROSS]);
    expect(hand[18]).toBe(1);
    expect(hand[19]).toBe(1);
    expect(hand[20]).toBe(1);
    expect(hand[21]).toBe(1);
    expect(hand[22]).toBe(0);
    const nori = buildNoriTable(hand, 0);
    expect(nori[18]).toBe(3);
  });
});

describe("初期状態", () => {
  it("777 の 777 は 16R", () => {
    const hand = new Uint8Array(27);
    hand[P7] = 3;
    hand[S7] = 3;
    expect(initialState(hand, "normal").label).toBe("16R");
  });

  it("777 のみは確変", () => {
    const hand = new Uint8Array(27);
    hand[P7] = 3;
    expect(initialState(hand, "normal").label).toBe("確変");
  });

  it("リーチ役満は 777 なしでも確変", () => {
    const hand = new Uint8Array(27);
    expect(initialState(hand, "riichiYakuman").label).toBe("確変");
  });

  it("リーチ役満の 777 は 16R", () => {
    const hand = new Uint8Array(27);
    hand[P7] = 3;
    expect(initialState(hand, "riichiYakuman").label).toBe("16R");
    expect(initialState(hand, "riichiYakuman").is16R).toBe(true);
    hand[S7] = 3;
    expect(initialState(hand, "riichiYakuman").label).toBe("16R");
  });

  it("通常手とリーチなし役満は同じ", () => {
    const hand = new Uint8Array(27);
    expect(initialState(hand, "normal")).toEqual(
      initialState(hand, "yakumanNoRiichi"),
    );
  });
});

describe("山", () => {
  it("ウルトラ 108 / スーパー 112", () => {
    expect(fullSetSize("ultra")).toBe(108);
    expect(fullSetSize("super")).toBe(112);
    const u = fullSetCounts("ultra");
    const s = fullSetCounts("super");
    expect(u.reduce((a, b) => a + b, 0)).toBe(108);
    expect(s.reduce((a, b) => a + b, 0)).toBe(112);
    expect(u[MAN7]).toBe(4);
    expect(s[MAN7]).toBe(0);
    expect(s[P7]).toBe(8);
    expect(s[S7]).toBe(8);
  });

  it("手牌と花牌をプールから除く", () => {
    const concealed = parseHand("123456789p東東南南");
    expect(concealed.length).toBe(13);
    const pool = remainingPool("ultra", [...concealed, 18], [], 2);
    expect(pool.length).toBe(108 - 14 - 2);
    expect([...pool].filter((t) => t === FLOWER).length).toBe(2);
  });

  it("グランドクロスは風牌を 1 枚ずつ除く", () => {
    const pool = remainingPool("ultra", [], [GRAND_CROSS], 0);
    expect(pool.length).toBe(104);
    expect([...pool].filter((t) => t === 18).length).toBe(3);
    expect([...pool].filter((t) => t === 21).length).toBe(3);
    expect([...pool].filter((t) => t === 22).length).toBe(4);
  });

  it("指定した牌を山から除外する", () => {
    const pool = remainingPool("ultra", [], [], 0, [18, 18, FLOWER]);
    expect(pool.length).toBe(105);
    expect([...pool].filter((t) => t === 18).length).toBe(2);
    expect([...pool].filter((t) => t === FLOWER).length).toBe(3);
  });

  it("確定牌はプールから除き、毎回山に入る", () => {
    const forced = [FLOWER, MAN7, 0];
    const pool = remainingPool("ultra", [], [], 0, [], forced);
    expect(pool.length).toBe(105);
    expect([...pool].filter((t) => t === FLOWER).length).toBe(3);
    expect([...pool].filter((t) => t === MAN7).length).toBe(3);
    expect([...pool].filter((t) => t === 0).length).toBe(3);
    for (let n = 0; n < 40; n++) {
      const dest = new Uint8Array(10);
      drawWall(pool, 10, Math.random, dest, forced);
      expect([...dest].filter((t) => t === FLOWER).length).toBeGreaterThanOrEqual(1);
      expect([...dest].filter((t) => t === MAN7).length).toBeGreaterThanOrEqual(1);
      expect([...dest].filter((t) => t === 0).length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("バリデーション", () => {
  it("面前枚数と種上限を見る", () => {
    const errors = validateInput({
      mode: "ultra",
      winType: "normal",
      concealed: parseHand("11111222233334p"),
      kongs: [],
      flowers: 0,
      tons: 20,
      guard: 0,
      excluded: [],
      forced: [],
    });
    expect(errors.some((e) => e.includes("1p"))).toBe(true);
  });

  it("14 枚なら通る", () => {
    const errors = validateInput({
      mode: "ultra",
      winType: "normal",
      concealed: parseHand("777888p777888s東東"),
      kongs: [],
      flowers: 0,
      tons: 20,
      guard: 0,
      excluded: [],
      forced: [],
    });
    expect(errors).toEqual([]);
  });

  it("グランドクロスはウルトラのみ、面前 11 枚", () => {
    const concealed = parseHand("777888p777s東東");
    expect(concealed.length).toBe(11);
    expect(
      validateInput({
        mode: "ultra",
        winType: "normal",
        concealed,
        kongs: [GRAND_CROSS],
        flowers: 0,
        tons: 20,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toEqual([]);
    expect(
      validateInput({
        mode: "super",
        winType: "normal",
        concealed,
        kongs: [GRAND_CROSS],
        flowers: 0,
        tons: 20,
        guard: 0,
        excluded: [],
        forced: [],
      }).some((e) => e.includes("グランドクロス")),
    ).toBe(true);
  });

  it("山からの除外は残り枚数を見る", () => {
    const base = {
      mode: "ultra" as const,
      winType: "normal" as const,
      concealed: parseHand("777888p777888s東東"),
      kongs: [] as number[],
      flowers: 0,
      tons: 20,
      guard: 0,
    };
    expect(validateInput({ ...base, excluded: [0, 0, 0, 0], forced: [] })).toEqual(
      [],
    );
    expect(
      validateInput({ ...base, excluded: [0, 0, 0, 0, 0], forced: [] }).some(
        (e) => e.includes("1p"),
      ),
    ).toBe(true);
  });

  it("手牌・除外・確定の合計は牌セットを超えない", () => {
    const base = {
      mode: "ultra" as const,
      winType: "normal" as const,
      concealed: parseHand("11112222333344p"),
      kongs: [] as number[],
      flowers: 0,
      tons: 20,
      guard: 0,
    };
    expect(
      validateInput({ ...base, excluded: [0], forced: [] }).some((e) =>
        e.includes("1p"),
      ),
    ).toBe(true);
    expect(
      validateInput({ ...base, excluded: [], forced: [1] }).some((e) =>
        e.includes("2p"),
      ),
    ).toBe(true);
    expect(
      validateInput({
        ...base,
        concealed: parseHand("11122233344455p"),
        excluded: [8, 8],
        forced: [8, 8, 8],
      }).some((e) => e.includes("9p")),
    ).toBe(true);
    expect(
      validateInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777888p777888s東東"),
        kongs: [],
        flowers: 0,
        tons: 20,
        guard: 0,
        excluded: [0, 0],
        forced: [0, 0],
      }),
    ).toEqual([]);
    expect(
      validateInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777888p777888s東東"),
        kongs: [],
        flowers: 0,
        tons: 1,
        guard: 0,
        excluded: [],
        forced: [0, 1, 2],
      }).some((e) => e.includes("確定牌")),
    ).toBe(true);
  });
});

describe("理論最大", () => {
  it("16R 開始は最良 2n 枚の 2 倍", () => {
    expect(
      theoreticalMaxFromInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777888p777888s東東"),
        kongs: [],
        flowers: 0,
        tons: 1,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toBe(24);
    expect(
      theoreticalMaxFromInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777888p777888s東東"),
        kongs: [],
        flowers: 0,
        tons: 5,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toBe(108);
  });

  it("通常開始は突確して確変・16R に入る", () => {
    expect(
      theoreticalMaxFromInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("111222333p11122s"),
        kongs: [],
        flowers: 0,
        tons: 2,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toBe(42);
  });

  it("確変のみで突確できないときは倍にしない", () => {
    expect(
      theoreticalMaxFromInput({
        mode: "ultra",
        winType: "normal",
        concealed: parseHand("777p11s東東南西北白白發中"),
        kongs: [],
        flowers: 0,
        tons: 1,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toBe(8);
  });

  it("スーパーの花牌は突確に使わない", () => {
    expect(
      theoreticalMaxFromInput({
        mode: "super",
        winType: "normal",
        concealed: parseHand("777p11s東東南西北白白發中"),
        kongs: [],
        flowers: 2,
        tons: 1,
        guard: 0,
        excluded: [],
        forced: [],
      }),
    ).toBe(12);
  });
});

describe("牌名", () => {
  it("ID を記法に戻す", () => {
    expect(tileName(0)).toBe("1p");
    expect(tileName(15)).toBe("7s");
    expect(tileName(18)).toBe("東");
    expect(tileName(FLOWER)).toBe("花");
    expect(tileName(GRAND_CROSS)).toBe("グランドクロス");
  });
});
