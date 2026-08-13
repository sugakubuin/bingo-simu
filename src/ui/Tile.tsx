import { FLOWER, MAN7, tileName } from "../domain/tiles";

const HONOR_FILES = ["Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun"] as const;

export function tileSrc(kind: number): string {
  if (kind >= 0 && kind <= 8) return `/tiles/Pin${kind + 1}.svg`;
  if (kind >= 9 && kind <= 17) return `/tiles/Sou${kind - 8}.svg`;
  if (kind >= 18 && kind <= 24) return `/tiles/${HONOR_FILES[kind - 18]}.svg`;
  if (kind === FLOWER) return "/tiles/Flower.svg";
  if (kind === MAN7) return "/tiles/Man7.svg";
  return "/tiles/Pin1.svg";
}

type Props = {
  kind: number;
};

export function Tile({ kind }: Props) {
  return (
    <img
      src={tileSrc(kind)}
      alt={tileName(kind)}
      className="tile-svg"
      draggable={false}
    />
  );
}
