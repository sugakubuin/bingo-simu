import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { parseHand, formatHand } from "./domain/parse";
import { validateInput } from "./domain/validate";
import { buildNoriTable, handCounts } from "./domain/nori";
import { initialState } from "./domain/initialState";
import { ModeToggle } from "./components/ModeToggle";
import { WinTypeSelect } from "./components/WinTypeSelect";
import { HandInput, tryParseText } from "./components/HandInput";
import { KongInput } from "./components/KongInput";
import { WallTilesInput } from "./components/ExcludeInput";
import { ParamsForm } from "./components/ParamsForm";
import { ResultsSummary } from "./components/ResultsSummary";
import { NoriTable } from "./components/NoriTable";
import { useSimulation } from "./hooks/useSimulation";
import { FLOWER, GRAND_CROSS, MAN7, WINDS, expandKong } from "./domain/tiles";
import { fullSetCounts, fullSetSize } from "./domain/wall";
import type { Mode, SimInput, WinType } from "./types";

const ResultsCharts = lazy(async () => {
  const m = await import("./components/ResultsCharts");
  return { default: m.ResultsCharts };
});

const SAMPLE = parseHand("123567p567777s11z");

function kindCount(concealed: number[], kongs: number[], kind: number): number {
  let n = 0;
  for (const t of concealed) if (t === kind) n++;
  for (const t of kongs) {
    for (const tile of expandKong(t)) if (tile === kind) n++;
  }
  return n;
}

function usedOf(
  concealed: number[],
  kongs: number[],
  flowers: number,
  excluded: number[],
  forced: number[],
  kind: number,
): number {
  return (
    kindCount(concealed, kongs, kind) +
    (kind === FLOWER ? flowers : 0) +
    excluded.filter((t) => t === kind).length +
    forced.filter((t) => t === kind).length
  );
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
  const [forced, setForced] = useState<number[]>([]);
  const sim = useSimulation();

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    return () => {
      delete document.documentElement.dataset.mode;
    };
  }, [mode]);

  const input: SimInput = {
    mode,
    winType,
    concealed,
    kongs,
    flowers,
    tons,
    guard,
    excluded,
    forced,
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

  const remainingOf = (kind: number) =>
    (fullSetCounts(mode)[kind] ?? 0) -
    usedOf(concealed, kongs, flowers, excluded, forced, kind);

  const wallSlack =
    fullSetSize(mode) - (14 + kongs.length) - flowers - excluded.length - 2 * tons;
  const maxFlowers = Math.min(
    4,
    flowers + Math.max(0, remainingOf(FLOWER)),
    Math.max(flowers, wallSlack + flowers),
  );

  const canAddConcealed = (kind: number) =>
    concealed.length < expected &&
    kindCount(concealed, kongs, kind) < 4 &&
    remainingOf(kind) > 0;

  const canAddKong = (kind: number) => {
    if (kongs.length >= 4) return false;
    if (kind === GRAND_CROSS) {
      if (mode !== "ultra") return false;
      if (kongs.includes(GRAND_CROSS)) return false;
      return WINDS.every(
        (w) => kindCount(concealed, kongs, w) < 4 && remainingOf(w) > 0,
      );
    }
    return kindCount(concealed, kongs, kind) === 0 && remainingOf(kind) >= 4;
  };

  const onModeChange = (next: Mode) => {
    setMode(next);
    if (next !== "ultra") {
      setKongs((ks) => ks.filter((k) => k !== GRAND_CROSS));
      setExcluded((xs) => xs.filter((k) => k !== MAN7));
      setForced((xs) => xs.filter((k) => k !== MAN7));
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
      const remainAfter =
        fullSetSize(mode) - (14 + kongs.length) - flowers - (xs.length + 1);
      if (remainAfter < 2 * tons) return xs;
      const full = fullSetCounts(mode)[kind] ?? 0;
      if (usedOf(concealed, kongs, flowers, xs, forced, kind) >= full) return xs;
      return [...xs, kind];
    });
  };

  const onRemoveExcludedAt = (index: number) => {
    setExcluded((xs) => xs.filter((_, i) => i !== index));
  };

  const onAddForced = (kind: number) => {
    setForced((xs) => {
      if (xs.length >= 2 * tons) return xs;
      const full = fullSetCounts(mode)[kind] ?? 0;
      if (usedOf(concealed, kongs, flowers, excluded, xs, kind) >= full) return xs;
      return [...xs, kind];
    });
  };

  const onRemoveForcedAt = (index: number) => {
    setForced((xs) => xs.filter((_, i) => i !== index));
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
          ビンゴめくりシミュレータ
        </a>
        <p className="nav-meta">10万回試行で期待値と分布を計算</p>
      </header>

      <main className="page">
        <section className="rail" aria-label="入力">
          <ModeToggle value={mode} onChange={onModeChange} />
          <WinTypeSelect
            value={winType}
            onChange={(next) => {
              setWinType(next);
              if (next === "riichiYakuman" && guard < 1) setGuard(1);
            }}
          />
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
          <ParamsForm
            flowers={flowers}
            tons={tons}
            guard={guard}
            maxFlowers={maxFlowers}
            minGuard={winType === "riichiYakuman" ? 1 : 0}
            onFlowers={(n) => setFlowers(Math.min(n, maxFlowers))}
            onTons={(n) => setTons(Math.min(30, Math.max(1, n || 1)))}
            onGuard={setGuard}
          />
          <WallTilesInput
            tiles={excluded}
            mode={mode}
            label="山から除外"
            help="河・他家・ドラ表示など、山に残さない牌。生成する各山から除きます。"
            empty="除外なし"
            resetTitle="除外を空にする"
            addTitle="除外する"
            onAdd={onAddExcluded}
            onRemoveAt={onRemoveExcludedAt}
            onReset={() => setExcluded([])}
            remainingOf={(k) => (wallSlack <= 0 ? 0 : remainingOf(k))}
          />
          <WallTilesInput
            tiles={forced}
            mode={mode}
            label="山に確定"
            help="生成する各山に必ず含める牌。位置はランダムです。"
            empty="確定なし"
            resetTitle="確定を空にする"
            addTitle="確定する"
            onAdd={onAddForced}
            onRemoveAt={onRemoveForcedAt}
            onReset={() => setForced([])}
            remainingOf={(k) => (forced.length >= 2 * tons ? 0 : remainingOf(k))}
          />
          {errors
            .filter((e) => !e.includes("が必要です（いま"))
            .map((e) => (
            <p key={e} className="err">
              {e}
            </p>
          ))}
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
                手牌を入れて実行すると、期待値や分布が出ます。
              </p>
            </div>
          ) : null}
          <NoriTable nori={liveNori.nori} mode={mode} />
          <p className="foot-note">牌画 FluffyStuff CC BY 4.0 · 永続化なし</p>
        </section>
      </main>

      <aside className="cta-sticky">
        <span className="help">
          {sim.running
            ? "計算中"
            : `入力済み基本手牌 ${concealed.length}枚/${expected}枚 (槓${kongs.length})`}
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
    </>
  );
}
