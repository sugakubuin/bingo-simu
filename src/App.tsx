import { lazy, Suspense, useMemo, useState } from "react";
import { parseHand, formatHand } from "./domain/parse";
import { validateInput } from "./domain/validate";
import { buildNoriTable, handCounts } from "./domain/nori";
import { initialState } from "./domain/initialState";
import { ModeToggle } from "./components/ModeToggle";
import { WinTypeSelect } from "./components/WinTypeSelect";
import { HandInput, tryParseText } from "./components/HandInput";
import { KongInput } from "./components/KongInput";
import { ExcludeInput } from "./components/ExcludeInput";
import { ParamsForm } from "./components/ParamsForm";
import { ResultsSummary } from "./components/ResultsSummary";
import { NoriTable } from "./components/NoriTable";
import { useSimulation } from "./hooks/useSimulation";
import { FLOWER, GRAND_CROSS, MAN7, WINDS, expandKong } from "./domain/tiles";
import { fullSetCounts } from "./domain/wall";
import type { Mode, SimInput, WinType } from "./types";

const ResultsCharts = lazy(async () => {
  const m = await import("./components/ResultsCharts");
  return { default: m.ResultsCharts };
});

const SAMPLE = parseHand("777888p777888s11z");

function kindCount(concealed: number[], kongs: number[], kind: number): number {
  let n = 0;
  for (const t of concealed) if (t === kind) n++;
  for (const t of kongs) {
    for (const tile of expandKong(t)) if (tile === kind) n++;
  }
  return n;
}

export function App() {
  const [mode, setMode] = useState<Mode>("super");
  const [winType, setWinType] = useState<WinType>("normal");
  const [concealed, setConcealed] = useState<number[]>(SAMPLE);
  const [kongs, setKongs] = useState<number[]>([]);
  const [text, setText] = useState(formatHand(SAMPLE));
  const [textError, setTextError] = useState<string | null>(null);
  const [flowers, setFlowers] = useState(0);
  const [tons, setTons] = useState(20);
  const [guard, setGuard] = useState(0);
  const [excluded, setExcluded] = useState<number[]>([]);
  const sim = useSimulation();

  const input: SimInput = {
    mode,
    winType,
    concealed,
    kongs,
    flowers,
    tons,
    guard,
    excluded,
  };
  const errors = validateInput(input);
  const expected = 14 - 3 * kongs.length;

  const liveNori = useMemo(() => {
    const hand = handCounts(concealed, kongs);
    return {
      nori: Array.from(buildNoriTable(hand, flowers)),
      initial: initialState(hand, winType),
    };
  }, [concealed, kongs, flowers, winType]);

  const canAddConcealed = (kind: number) =>
    concealed.length < expected && kindCount(concealed, kongs, kind) < 4;

  const canAddKong = (kind: number) => {
    if (kongs.length >= 4) return false;
    if (kind === GRAND_CROSS) {
      if (mode !== "ultra") return false;
      if (kongs.includes(GRAND_CROSS)) return false;
      return WINDS.every((w) => kindCount(concealed, kongs, w) < 4);
    }
    return kindCount(concealed, kongs, kind) === 0;
  };

  const remainingOf = (kind: number) => {
    const full = fullSetCounts(mode)[kind] ?? 0;
    const inHand = kindCount(concealed, kongs, kind);
    const flowerUsed = kind === FLOWER ? flowers : 0;
    const ex = excluded.filter((t) => t === kind).length;
    return full - inHand - flowerUsed - ex;
  };

  const onModeChange = (next: Mode) => {
    setMode(next);
    if (next !== "ultra") {
      setKongs((ks) => ks.filter((k) => k !== GRAND_CROSS));
      setExcluded((xs) => xs.filter((k) => k !== MAN7));
    }
  };

  const onResetHand = () => {
    setConcealed([]);
    setText("");
    setTextError(null);
    setKongs([]);
  };

  const onAddTile = (kind: number) => {
    if (!canAddConcealed(kind)) return;
    const next = [...concealed, kind];
    setConcealed(next);
    setText(formatHand(next));
    setTextError(null);
  };

  const onRemoveTile = (index: number) => {
    const next = concealed.filter((_, i) => i !== index);
    setConcealed(next);
    setText(formatHand(next));
    setTextError(null);
  };

  const onTextChange = (value: string) => {
    setText(value);
    const parsed = tryParseText(value);
    if ("error" in parsed) {
      setTextError(parsed.error);
      return;
    }
    setTextError(null);
    setConcealed(parsed.tiles);
  };

  const onAddKong = (kind: number) => {
    if (!canAddKong(kind)) return;
    setKongs([...kongs, kind]);
  };

  const onRemoveKong = (index: number) => {
    setKongs(kongs.filter((_, i) => i !== index));
  };

  const onAddExcluded = (kind: number) => {
    setExcluded((xs) => {
      const used =
        kindCount(concealed, kongs, kind) +
        (kind === FLOWER ? flowers : 0) +
        xs.filter((t) => t === kind).length;
      const full = fullSetCounts(mode)[kind] ?? 0;
      if (used >= full) return xs;
      return [...xs, kind];
    });
  };

  const onRemoveExcludedAt = (index: number) => {
    setExcluded((xs) => xs.filter((_, i) => i !== index));
  };

  const run = () => {
    if (errors.length || textError) return;
    sim.run(input);
  };

  const runDisabled = errors.length > 0 || Boolean(textError) || sim.running;

  return (
    <>
      <header className="nav-edge">
        <a className="wordmark" href="/">
          ビンゴ捲りシミュレータ
        </a>
        <p className="nav-meta">10 万回試行で期待値と分布を計算</p>
      </header>

      <main className="page">
        <section className="rail" aria-label="入力">
          <ModeToggle value={mode} onChange={onModeChange} />
          <WinTypeSelect value={winType} onChange={setWinType} />
          <p className="help">
            初期状態（自動判定）{" "}
            <span className="badge">{liveNori.initial.label}</span>
          </p>
          <HandInput
            concealed={concealed}
            text={text}
            textError={textError}
            onTextChange={onTextChange}
            onAdd={onAddTile}
            onRemoveAt={onRemoveTile}
            onReset={onResetHand}
            canAdd={canAddConcealed}
          />
          <KongInput
            kongs={kongs}
            mode={mode}
            onAdd={onAddKong}
            onRemoveAt={onRemoveKong}
            canAdd={canAddKong}
          />
          <ExcludeInput
            excluded={excluded}
            mode={mode}
            onAdd={onAddExcluded}
            onRemoveAt={onRemoveExcludedAt}
            onReset={() => setExcluded([])}
            remainingOf={remainingOf}
          />
          <ParamsForm
            flowers={flowers}
            tons={tons}
            guard={guard}
            onFlowers={setFlowers}
            onTons={(n) => setTons(Math.min(30, Math.max(1, n || 1)))}
            onGuard={setGuard}
          />
          {errors.map((e) => (
            <p key={e} className="err">
              {e}
            </p>
          ))}
          <button
            type="button"
            className="btn btn-primary run-rail"
            onClick={run}
            disabled={runDisabled}
            data-state={sim.running ? "loading" : undefined}
          >
            {sim.running ? "計算中" : "10 万回シミュレート"}
          </button>
        </section>

        <section className="canvas" aria-label="結果">
          {sim.running ? (
            <div>
              <p className="mono-label">Running</p>
              <h2>山を 10 万本、生成しています</h2>
              <div className="progress-track" aria-hidden="true">
                <div
                  className="progress-bar"
                  style={{ transform: `scaleX(${sim.progress})` }}
                />
              </div>
              <p className="help tnum">{Math.round(sim.progress * 100)}%</p>
            </div>
          ) : null}
          {sim.error ? <p className="err">{sim.error}</p> : null}
          {sim.stats ? (
            <>
              <ResultsSummary stats={sim.stats} />
              <Suspense fallback={<p className="help">分布を描画しています</p>}>
                <ResultsCharts stats={sim.stats} />
              </Suspense>
            </>
          ) : !sim.running ? (
            <div className="empty">
              <p className="mono-label">Result</p>
              <h2>まだ結果はありません</h2>
              <p className="help">
                {expected} 枚 / 槓 {kongs.length} を入れて実行すると、期待値と分布が出ます。
              </p>
            </div>
          ) : null}
          <NoriTable nori={liveNori.nori} mode={mode} />
        </section>
      </main>

      <aside className="cta-sticky">
        <span className="help">
          {sim.running ? "計算中" : errors[0] ?? `${expected} 枚 / 槓 ${kongs.length}`}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={run}
          disabled={runDisabled}
          data-state={sim.running ? "loading" : undefined}
        >
          {sim.running ? "計算中" : "シミュレート"}
        </button>
      </aside>

      <footer className="foot-line">
        <p>準拠 二向聴チューリップ公式ルール 2026/8/2 · 牌画 FluffyStuff CC BY 4.0 · 永続化なし</p>
      </footer>
    </>
  );
}
