import { useCountUp } from "../hooks/useCountUp";
import type { SimStats } from "../types";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function num(n: number, digits = 1): string {
  return n.toFixed(digits);
}

type Props = {
  stats: SimStats;
};

export function ResultsSummary({ stats }: Props) {
  const ev = useCountUp(stats.mean);
  return (
    <>
      <p className="result-mark">RESULT</p>
      <div className="readout">
        <div className="readout-top">
          <span className="mono-label"> {stats.trials.toLocaleString("ja-JP")} 回試行の期待枚数</span>
          <span className="badge">{stats.initial.label}</span>
        </div>
        <p className="readout-value tnum">
          {ev == null ? "—" : num(ev)}
          <span className="readout-unit"> 枚</span>
        </p>
      </div>
      <div className="stat-strip tnum">
        <div>
          <b>{num(stats.median)}</b>
          <span>中央値</span>
        </div>
        <div>
          <b>{stats.modeValue}</b>
          <span>最頻値</span>
        </div>
        <div>
          <b>{num(stats.stddev)}</b>
          <span>標準偏差</span>
        </div>
        <div>
          <b>{num(stats.meanTons)}</b>
          <span>平均トン</span>
        </div>
        <div>
          <b>{pct(stats.zeroRate)}</b>
          <span>0枚率</span>
        </div>
        <div>
          <b>{pct(stats.finishRate)}</b>
          <span>完走率</span>
        </div>
      </div>
      <div className="stat-strip tnum">
        <div>
          <b>{pct(stats.kakuhenRate)}</b>
          <span>確変率</span>
        </div>
        <div>
          <b>{pct(stats.r16Rate)}</b>
          <span>16R率</span>
        </div>
        <div>
          <b>{stats.max}</b>
          <span>最大枚数</span>
        </div>
      </div>
    </>
  );
}
