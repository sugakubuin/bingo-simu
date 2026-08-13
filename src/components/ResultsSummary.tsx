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
          <b>{num(stats.stddev)}</b>
          <span>標準偏差</span>
        </div>
        <div>
          <b>{pct(stats.zeroRate)}</b>
          <span>0 枚率</span>
        </div>
        <div>
          <b>{num(stats.meanTons)}</b>
          <span>平均トン</span>
        </div>
      </div>
      <table className="spec-sheet">
        <thead>
          <tr>
            <th>状態</th>
            <th>到達率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>確変</td>
            <td>{pct(stats.kakuhenRate)}</td>
          </tr>
          <tr>
            <td>突確</td>
            <td>{pct(stats.totsukakuRate)}</td>
          </tr>
          <tr>
            <td>16R</td>
            <td>{pct(stats.r16Rate)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
