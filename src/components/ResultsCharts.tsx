import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HIST_RANGES, sliceFreq, type HistRange } from "../sim/histogram";
import type { SimStats } from "../types";

type Props = {
  stats: SimStats;
};

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function tickLabels(range: HistRange): string[] {
  const step = range / 5;
  const ticks: string[] = [];
  for (let v = 0; v < range; v += step) ticks.push(String(v));
  ticks.push(`${range}+`);
  return ticks;
}

export function ResultsCharts({ stats }: Props) {
  const [range, setRange] = useState<HistRange>(50);
  const data = useMemo(
    () => sliceFreq(stats.freq, range),
    [stats.freq, range],
  );

  return (
    <div className="results-charts">
      <div className="chart-toolbar">
        <div className="block-head">
          <p className="mono-label">分布</p>
          <h2>枚数ごとの度数</h2>
        </div>
        <div>
          <p className="mono-label">表示範囲</p>
          <div className="seg" role="group" aria-label="表示範囲">
            {HIST_RANGES.map((n) => (
              <button
                key={n}
                type="button"
                className="seg-btn"
                aria-pressed={range === n}
                onClick={() => setRange(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={range >= 200 ? 0 : "8%"}>
            <CartesianGrid stroke="var(--color-rule)" vertical={false} />
            <XAxis
              dataKey="label"
              ticks={tickLabels(range)}
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--color-rule)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "var(--color-paper-2)" }}
              contentStyle={{
                background: "var(--color-paper-2)",
                border: "1px solid var(--color-rule)",
                borderRadius: 6,
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              formatter={(value) => {
                const n = typeof value === "number" ? value : Number(value);
                return [Number.isFinite(n) ? n.toLocaleString("ja-JP") : String(value), "回数"];
              }}
            />
            <Bar dataKey="count" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="stat-strip stat-strip-2 tnum">
        <div>
          <b>{pct(stats.kakuhenRate)}</b>
          <span>確変率</span>
        </div>
        <div>
          <b>{pct(stats.r16Rate)}</b>
          <span>16R率</span>
        </div>
      </div>
      <div className="block-head follow">
        <p className="mono-label">累積</p>
        <h2>n 枚以上のる確率</h2>
      </div>
      <div className="cdf">
        <div className="cdf-row is-head">
          <span>枚数</span>
          <span>確率</span>
        </div>
        {stats.cdf.map((row) => (
          <div key={row.n} className="cdf-row tnum">
            <span>{row.n} 枚以上</span>
            <span>{pct(row.rate)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
