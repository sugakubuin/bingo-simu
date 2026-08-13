const HONOR_CHAR: Record<string, number> = {
  東: 18,
  南: 19,
  西: 20,
  北: 21,
  白: 22,
  發: 23,
  発: 23,
  中: 24,
};

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export function parseHand(text: string): number[] {
  const tiles: number[] = [];
  const digits: number[] = [];

  const flush = (suit: string) => {
    if (digits.length === 0) {
      throw new ParseError(`スーツ ${suit} の前に数字がありません`);
    }
    for (const d of digits) {
      if (suit === "p") {
        if (d < 1 || d > 9) throw new ParseError(`筒子は 1–9 です: ${d}`);
        tiles.push(d - 1);
      } else if (suit === "s") {
        if (d < 1 || d > 9) throw new ParseError(`索子は 1–9 です: ${d}`);
        tiles.push(8 + d);
      } else if (suit === "m") {
        throw new ParseError("萬子は入力できません");
      } else if (suit === "z") {
        if (d < 1 || d > 7) throw new ParseError(`字牌は 1–7z です: ${d}`);
        tiles.push(17 + d);
      }
    }
    digits.length = 0;
  };

  for (const ch of text) {
    if (ch === " " || ch === "," || ch === "\n" || ch === "\t") continue;
    if (ch >= "0" && ch <= "9") {
      digits.push(Number(ch));
      continue;
    }
    const lower = ch.toLowerCase();
    if (lower === "p" || lower === "s" || lower === "m" || lower === "z") {
      flush(lower);
      continue;
    }
    if (HONOR_CHAR[ch] !== undefined) {
      if (digits.length > 0) {
        throw new ParseError("数字のあとにスーツがありません");
      }
      tiles.push(HONOR_CHAR[ch]);
      continue;
    }
    throw new ParseError(`不明な文字: ${ch}`);
  }
  if (digits.length > 0) {
    throw new ParseError("数字のあとにスーツがありません");
  }
  return tiles;
}

export function formatHand(tiles: readonly number[]): string {
  const pin: number[] = [];
  const sou: number[] = [];
  const honors: number[] = [];
  for (const t of tiles) {
    if (t >= 0 && t <= 8) pin.push(t + 1);
    else if (t >= 9 && t <= 17) sou.push(t - 8);
    else if (t >= 18 && t <= 24) honors.push(t);
  }
  pin.sort((a, b) => a - b);
  sou.sort((a, b) => a - b);
  honors.sort((a, b) => a - b);
  let s = "";
  if (pin.length) s += pin.join("") + "p";
  if (sou.length) s += sou.join("") + "s";
  if (honors.length) s += honors.map((h) => String(h - 17)).join("") + "z";
  return s;
}
