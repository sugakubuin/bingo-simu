import { useState } from "react";
import type { Mode } from "../types";
import { RulesModal } from "./RulesModal";

const OPTIONS: { id: Mode; label: string }[] = [
  { id: "super", label: "スーパービンゴ" },
  { id: "ultra", label: "ウルトラビンゴ" },
];

type Props = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

export function ModeToggle({ value, onChange }: Props) {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="field">
      <label id="mode-label">ビンゴ種目</label>
      <div className="seg" role="group" aria-labelledby="mode-label">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="seg-btn"
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          className="help-q"
          aria-label="各ゲームのルール"
          aria-haspopup="dialog"
          aria-expanded={rulesOpen}
          onClick={() => setRulesOpen(true)}
        >
          ?
        </button>
      </div>
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
