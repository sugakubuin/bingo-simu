export const PINZU_START = 0;
export const SOUZU_START = 9;
export const HONOR_START = 18;
export const FLOWER = 25;
export const MAN7 = 26;
export const KIND_COUNT = 27;

export const P7 = 6;
export const S7 = 15;

export const HONOR_NAMES = ["東", "南", "西", "北", "白", "發", "中"] as const;

export const HAND_KINDS: number[] = Array.from({ length: 25 }, (_, i) => i);

export function isPinzu(kind: number): boolean {
  return kind >= 0 && kind <= 8;
}

export function isSouzu(kind: number): boolean {
  return kind >= 9 && kind <= 17;
}

export function isHonor(kind: number): boolean {
  return kind >= 18 && kind <= 24;
}

export function prevOf(kind: number): number {
  if (kind <= 8) return kind === 0 ? 8 : kind - 1;
  if (kind <= 17) return kind === 9 ? 17 : kind - 1;
  if (kind <= 21) return kind === 18 ? 21 : kind - 1;
  if (kind <= 24) return kind === 22 ? 24 : kind - 1;
  return kind;
}

export function nextOf(kind: number): number {
  if (kind <= 8) return kind === 8 ? 0 : kind + 1;
  if (kind <= 17) return kind === 17 ? 9 : kind + 1;
  if (kind <= 21) return kind === 21 ? 18 : kind + 1;
  if (kind <= 24) return kind === 24 ? 22 : kind + 1;
  return kind;
}

export function tileName(kind: number): string {
  if (kind >= 0 && kind <= 8) return `${kind + 1}p`;
  if (kind >= 9 && kind <= 17) return `${kind - 8}s`;
  if (kind >= 18 && kind <= 24) return HONOR_NAMES[kind - 18];
  if (kind === FLOWER) return "花";
  if (kind === MAN7) return "7m";
  return `?${kind}`;
}

export function tileLabelJa(kind: number): string {
  if (kind >= 0 && kind <= 8) return `${kind + 1}筒`;
  if (kind >= 9 && kind <= 17) return `${kind - 8}索`;
  if (kind >= 18 && kind <= 24) return HONOR_NAMES[kind - 18];
  if (kind === FLOWER) return "花";
  if (kind === MAN7) return "七萬";
  return tileName(kind);
}
