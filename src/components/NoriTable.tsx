import { FLOWER, KIND_COUNT, MAN7 } from "../domain/tiles";
import { Tile } from "../ui/Tile";
import type { Mode } from "../types";

type Props = {
  nori: number[];
  mode: Mode;
};

export function NoriTable({ nori, mode }: Props) {
  const kinds: number[] = [];
  for (let k = 0; k < KIND_COUNT; k++) {
    if (k === MAN7 && mode !== "ultra") continue;
    kinds.push(k);
  }
  if (!kinds.includes(FLOWER)) kinds.push(FLOWER);

  return (
    <div>
      <div className="block-head">
        <p className="mono-label">のり</p>
        <h2>のり枚数テーブル</h2>
      </div>
      <p className="help">
        その牌がめくれたときにのる枚数。手牌は毎回再利用されます。
      </p>
      <div className="nori-grid">
        {kinds.map((k) => (
          <div key={k} className="nori-cell">
            <Tile kind={k} />
            <strong className="tnum">{nori[k] ?? 0}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
