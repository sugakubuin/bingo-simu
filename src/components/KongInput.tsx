import { HAND_KINDS } from "../domain/tiles";
import { Tile } from "../ui/Tile";
import { TileButton } from "../ui/TileButton";

type Props = {
  kongs: number[];
  onAdd: (kind: number) => void;
  onRemoveAt: (index: number) => void;
  canAdd: (kind: number) => boolean;
};

export function KongInput({ kongs, onAdd, onRemoveAt, canAdd }: Props) {
  const pinzu = HAND_KINDS.filter((k) => k <= 8);
  const souzu = HAND_KINDS.filter((k) => k >= 9 && k <= 17);
  const honors = HAND_KINDS.filter((k) => k >= 18);

  return (
    <div className="field">
      <label>槓子</label>
      <p className="help">槓子の牌種を最大 4 組選択。基本手牌は 14 − 3k 枚になります。</p>
      <div className="hand-strip kong-strip" aria-label="槓子">
        {kongs.length === 0 ? (
          <span className="help">槓なし</span>
        ) : (
          kongs.map((kind, i) => (
            <button
              key={`${kind}-${i}`}
              type="button"
              className="kong-group"
              onClick={() => onRemoveAt(i)}
              aria-label={`槓 ${i + 1} を外す`}
            >
              {[0, 1, 2, 3].map((n) => (
                <Tile key={n} kind={kind} />
              ))}
            </button>
          ))
        )}
      </div>
      <div className="tile-palette">
        <div className="tile-row" aria-label="槓・筒子">
          {pinzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title="槓として追加"
            />
          ))}
        </div>
        <div className="tile-row" aria-label="槓・索子">
          {souzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title="槓として追加"
            />
          ))}
        </div>
        <div className="tile-row" aria-label="槓・字牌">
          {honors.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
              title="槓として追加"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
