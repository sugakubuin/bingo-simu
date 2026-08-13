import { Tile } from "../ui/Tile";
import { tileName } from "../domain/tiles";

type Props = {
  kind: number;
  onClick: () => void;
  disabled?: boolean;
  dim?: boolean;
  title?: string;
};

export function TileButton({ kind, onClick, disabled, dim, title }: Props) {
  return (
    <button
      type="button"
      className={`tile-btn${dim ? " is-dim" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title ?? tileName(kind)}
      aria-label={title ?? `${tileName(kind)} を追加`}
    >
      <Tile kind={kind} />
    </button>
  );
}
