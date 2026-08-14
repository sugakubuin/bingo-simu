import { FLOWER, HAND_KINDS, MAN7, tileName } from "../domain/tiles";
import { Tile } from "../ui/Tile";
import { TileButton } from "../ui/TileButton";
import type { Mode } from "../types";

type Props = {
  excluded: number[];
  mode: Mode;
  onAdd: (kind: number) => void;
  onRemoveAt: (index: number) => void;
  onReset: () => void;
  remainingOf: (kind: number) => number;
};

export function ExcludeInput({
  excluded,
  mode,
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
        <label>山から除外</label>
        <button
          type="button"
          className="btn btn-ghost btn-compact"
          onClick={onReset}
          title="除外した牌をすべて戻す"
        >
          リセット
        </button>
      </div>
      <p className="help">
        見えている河・他家の手牌など、山に残っていない牌を指定します。タップで追加、除外中の牌をタップすると外します。
      </p>
      <div
        className={`hand-strip exclude-strip${excluded.length > 14 ? " is-wrap" : ""}`}
        aria-label="除外した牌"
      >
        {excluded.length === 0 ? (
          <span className="help">除外なし</span>
        ) : (
          excluded.map((kind, i) => (
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
        <div className="tile-row" aria-label="除外・筒子">
          {pinzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を山から除外`}
            />
          ))}
        </div>
        <div className="tile-row" aria-label="除外・索子">
          {souzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を山から除外`}
            />
          ))}
        </div>
        <div className="tile-row" aria-label="除外・字牌">
          {[...honors, ...extras].map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title={`${tileName(k)} を山から除外`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
