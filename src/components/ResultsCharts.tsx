import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HIST_RANGES,
  sliceFreq,
  sliceSurvival,
  survivalFromFreq,
  tScore,
  type HistRange,
} from "../sim/histogram";
import type { SimStats } from "../types";

type Props = {
  stats: SimStats;
};

type TipPoint = {
  label: string;
  n: number;
  count: number;
  topRate: number;
  hensachi: number;
  overflow?: boolean;
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

function cdfTicks(range: HistRange): string[] {
  const step = range / 5;
  const ticks: string[] = [];
  for (let v = 0; v <= range; v += step) ticks.push(String(v));
  return ticks;
}

function DistTooltip({
  active,
  payload,
  kind,
}: {
  active?: boolean;
  payload?: Array<{ payload: TipPoint }>;
  kind: "freq" | "cdf";
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const title = d.overflow || kind === "cdf" ? `${d.n} 枚以上` : `${d.n} 枚`;
  return (
    <div className="chart-tip">
      <p className="chart-tip-title">{title}</p>
      <p>
        {kind === "cdf" ? "累積" : "回数"} {d.count.toLocaleString("ja-JP")}
      </p>
      <p>上位 {pct(d.topRate)}</p>
      <p>偏差値 {Number.isFinite(d.hensachi) ? d.hensachi.toFixed(1) : "—"}</p>
    </div>
  );
}

export function ResultsCharts({ stats }: Props) {
  const [range, setRange] = useState<HistRange>(50);
  const survival = useMemo(() => survivalFromFreq(stats.freq), [stats.freq]);
  const histData = useMemo(() => {
    return sliceFreq(stats.freq, range).map((d, i) => {
      const overflow = i === range;
      const n = overflow ? range : i;
      return {
        ...d,
        n,
        overflow,
        topRate: stats.trials > 0 ? (survival[n] ?? 0) / stats.trials : 0,
        hensachi: tScore(n, stats.mean, stats.stddev),
      };
    });
  }, [stats.freq, stats.trials, stats.mean, stats.stddev, survival, range]);
  const cdfData = useMemo(
    () => sliceSurvival(survival, range, stats.trials, stats.mean, stats.stddev),
    [survival, range, stats.trials, stats.mean, stats.stddev],
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
          <BarChart data={histData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={range >= 200 ? 0 : "8%"}>
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
              wrapperStyle={{ outline: "none" }}
              content={<DistTooltip kind="freq" />}
            />
            <Bar dataKey="count" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="block-head follow">
        <p className="mono-label">累積</p>
        <h2>n 枚以上のる確率</h2>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cdfData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-rule)" vertical={false} />
            <XAxis
              dataKey="label"
              ticks={cdfTicks(range)}
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--color-rule)" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-accent)" }}
              wrapperStyle={{ outline: "none" }}
              content={<DistTooltip kind="cdf" />}
            />
            <Area
              type="monotone"
              dataKey="pct"
              stroke="var(--color-accent)"
              fill="var(--color-accent)"
              fillOpacity={0.28}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
