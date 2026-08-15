import { FLOWER, HAND_KINDS, MAN7, tileName } from "../domain/tiles";
import { Tile } from "../ui/Tile";
import { TileButton } from "../ui/TileButton";
import type { Mode } from "../types";

type Props = {
  tiles: number[];
  mode: Mode;
  label: string;
  help: string;
  empty: string;
  resetTitle: string;
  addTitle: string;
  onAdd: (kind: number) => void;
  onRemoveAt: (index: number) => void;
  onReset: () => void;
  remainingOf: (kind: number) => number;
};

export function WallTilesInput({
  tiles,
  mode,
  label,
  help,
  empty,
  resetTitle,
  addTitle,
  onAdd,
  onRemoveAt,
  onReset,
  remainingOf,
}: Props) {
  const pinzu = HAND_KINDS.filter((k) => k <= 8);
  const souzu = HAND_KINDS.filter((k) => k >= 9 && k <= 17);
  const honors = HAND_KINDS.filter((k) => k >= 18);
  const extras = mode === "ultra" ? [FLOWER, MAN7] : [FLOWER];
  const canAdd = (kind: number) => remainingOf(kind) > 0;

  return (
    <div className="field">
      <div className="field-head">
        <label>{label}</label>
        <button
          type="button"
          className="btn btn-ghost btn-compact"
          onClick={onReset}
          title={resetTitle}
        >
          リセット
        </button>
      </div>
      <p className="help">{help}</p>
      <div
        className={`hand-strip exclude-strip${tiles.length > 14 ? " is-wrap" : ""}`}
        aria-label={label}
      >
        {tiles.length === 0 ? (
          <span className="help">{empty}</span>
        ) : (
          tiles.map((kind, i) => (
            <button
              key={`${kind}-${i}`}
              type="button"
              className="tile-btn"
              onClick={() => onRemoveAt(i)}
              aria-label={`${tileName(kind)} を戻す`}
            >
              <Tile kind={kind} />
            </button>
          ))
        )}
      </div>
      <div className="tile-palette">
        <div className="tile-row" aria-label={`${label}・筒子`}>
          {pinzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を${addTitle}`}
            />
          ))}
        </div>
        <div className="tile-row" aria-label={`${label}・索子`}>
          {souzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を${addTitle}`}
            />
          ))}
        </div>
        <div className="tile-row" aria-label={`${label}・字牌`}>
          {[...honors, ...extras].map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を${addTitle}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
