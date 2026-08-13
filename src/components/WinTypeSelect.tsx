import type { WinType } from "../types";

const OPTIONS: { id: WinType; label: string }[] = [
  { id: "normal", label: "通常手・リーチなし役満" },
  { id: "riichiYakuman", label: "リーチ役満・天地人和" },
];

type Props = {
  value: WinType;
  onChange: (value: WinType) => void;
};

export function WinTypeSelect({ value, onChange }: Props) {
  return (
    <div className="field">
      <label id="win-label">和了種別</label>
      <div className="seg" role="group" aria-labelledby="win-label">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="seg-btn"
            aria-pressed={
              opt.id === "normal"
                ? value === "normal" || value === "yakumanNoRiichi"
                : value === opt.id
            }
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
