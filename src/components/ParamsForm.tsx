type Props = {
  flowers: number;
  tons: number;
  guard: number;
  onFlowers: (n: number) => void;
  onTons: (n: number) => void;
  onGuard: (n: number) => void;
};

export function ParamsForm({
  flowers,
  tons,
  guard,
  onFlowers,
  onTons,
  onGuard,
}: Props) {
  return (
    <div className="field-stack">
      <div className="field">
        <label>花牌抜き枚数</label>
        <div className="seg" role="group" aria-label="花牌抜き枚数">
          {[0, 1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className="seg-btn"
              aria-pressed={flowers === n}
              onClick={() => onFlowers(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="tons">残りトン数</label>
        <div className="seg">
          {[10, 20, 30].map((n) => (
            <button
              key={n}
              type="button"
              className="seg-btn"
              aria-pressed={tons === n}
              onClick={() => onTons(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          id="tons"
          type="number"
          min={1}
          max={30}
          value={tons}
          onChange={(e) => onTons(Number(e.target.value))}
        />
      </div>
      <div className="field">
        <label>転落保証回数</label>
        <div className="seg" role="group" aria-label="転落保証">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              className="seg-btn"
              aria-pressed={guard === n}
              onClick={() => onGuard(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
