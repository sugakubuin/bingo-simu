import { HAND_KINDS } from "../domain/tiles";
import { formatHand, parseHand, ParseError } from "../domain/parse";
import { TileButton } from "../ui/TileButton";
import { Tile } from "../ui/Tile";

type Props = {
  concealed: number[];
  text: string;
  textError: string | null;
  onTextChange: (text: string) => void;
  onAdd: (kind: number) => void;
  onRemoveAt: (index: number) => void;
  canAdd: (kind: number) => boolean;
};

export function HandInput({
  concealed,
  text,
  textError,
  onTextChange,
  onAdd,
  onRemoveAt,
  canAdd,
}: Props) {
  const pinzu = HAND_KINDS.filter((k) => k <= 8);
  const souzu = HAND_KINDS.filter((k) => k >= 9 && k <= 17);
  const honors = HAND_KINDS.filter((k) => k >= 18);

  return (
    <div className="field">
      <label>基本手牌</label>
      <p className="help">
        牌をタップして追加。手牌の牌をタップすると外す。槓子は下で入力。
      </p>
      <div className="hand-strip" aria-label="面前手牌">
        {concealed.length === 0 ? (
          <span className="help">まだ牌がありません</span>
        ) : (
          concealed.map((kind, i) => (
            <button
              key={`${kind}-${i}`}
              type="button"
              className="tile-btn"
              onClick={() => onRemoveAt(i)}
              aria-label={`${i + 1} 枚目を外す`}
            >
              <Tile kind={kind} />
            </button>
          ))
        )}
      </div>
      <div className="tile-palette">
        <div className="tile-row" aria-label="筒子">
          {pinzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
            />
          ))}
        </div>
        <div className="tile-row" aria-label="索子">
          {souzu.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
            />
          ))}
        </div>
        <div className="tile-row" aria-label="字牌">
          {honors.map((k) => (
            <TileButton
              key={k}
              kind={k}
              onClick={() => onAdd(k)}
              disabled={!canAdd(k)}
              dim={!canAdd(k)}
            />
          ))}
        </div>
      </div>
      <label htmlFor="hand-text">テキスト</label>
      <textarea
        id="hand-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        aria-invalid={textError ? true : undefined}
        spellCheck={false}
        placeholder="777888p777888s11z"
      />
      {textError ? <p className="err">{textError}</p> : null}
    </div>
  );
}

export function syncTextFromTiles(tiles: number[]): string {
  return formatHand(tiles);
}

export function tryParseText(text: string): { tiles: number[] } | { error: string } {
  try {
    return { tiles: parseHand(text) };
  } catch (e) {
    const msg = e instanceof ParseError ? e.message : "牌姿を読めません";
    return { error: msg };
  }
}
