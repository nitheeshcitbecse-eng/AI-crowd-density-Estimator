import { useState, useEffect } from "react";
import { TopBar, SectionCard, PageWrapper } from "../components/UI";
import { api } from "../Services/api";

const PERIOD_MAP = {
  "Last 24 Hours": 24,
  "Last 7 Days": 168,
  "Last 30 Days": 720,
  "Last 90 Days": 2160,
};

function LineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const w = 600,
    h = 140,
    pad = 20;
  const pts = data.map((d, i) => ({
    x: pad + (i / (data.length - 1 || 1)) * (w - pad * 2),
    y: h - pad - (d.value / max) * (h - pad * 2),
  }));
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const area = path + ` L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((v) => {
        const y = h - pad - (v / 100) * (h - pad * 2);
        return (
          <line
            key={v}
            x1={pad}
            y1={y}
            x2={w - pad}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}
      <path d={area} fill="url(#lg)" />
      <path
        d={path}
        fill="none"
        stroke="#06b6d4"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }}
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#06b6d4"
            stroke="#080c1a"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }}
          />
          <text
            x={p.x}
            y={h - 2}
            fill="rgba(255,255,255,0.3)"
            fontSize="8"
            textAnchor="middle"
          >
            {data[i].date || `T${i}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MiniDonut({ data }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let offset = 0;
  const r = 45,
    cx = 55,
    cy = 55,
    stroke = 14,
    circ = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "55px 55px",
              filter: `drop-shadow(0 0 4px ${d.color}60)`,
            }}
          />
        );
        offset += dash;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#64748b"
        fontSize="14"
        fontWeight="700"
      >
        {total.toFixed(0)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#64748b" fontSize="7">
        Total
      </text>
    </svg>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("Last 7 Days");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [alertAnalytics, setAlertAnalytics] = useState(null);
  const [temporalData, setTemporalData] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [densityData, setDensityData] = useState([]);

  const periodHours = PERIOD_MAP[range] || 168;

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [systemRes, alertRes, temporalRes, camerasRes, heatmapRes] =
        await Promise.allSettled([
          api.getSystemAnalytics(periodHours),
          api.getAlertAnalytics(periodHours),
          api.getTemporalAnalytics(24, "minute"),
          api.listCameras({ limit: 20 }),
          api.getHeatmapData(periodHours),
        ]);

      // System analytics
      if (systemRes.status === "fulfilled" && systemRes.value?.data?.success) {
        setAnalytics(systemRes.value.data.data);
      }

      // Alert analytics
      if (alertRes.status === "fulfilled" && alertRes.value?.data?.success) {
        setAlertAnalytics(alertRes.value.data.data);
      }

      // Temporal data for chart
      if (
        temporalRes.status === "fulfilled" &&
        temporalRes.value?.data?.success
      ) {
        const temporal = temporalRes.value.data.data.temporal_data || [];

        setTemporalData(
          temporal.map((d) => ({
            date: d.timestamp,
            value: d.avg_density,
          })),
        );
      }

      if (
        heatmapRes.status === "fulfilled" &&
        heatmapRes.value?.data?.success
      ) {
        const points = heatmapRes.value.data.data.points || [];

        const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6"];

        // Top Locations
        const sorted = [...points]
          .sort(
            (a, b) => (b.density_percentage || 0) - (a.density_percentage || 0),
          )
          .slice(0, 5);

        setTopLocations(
          sorted.map((p, i) => ({
            name: p.camera_name,
            value: Math.round(p.density_percentage || 0),
            color: colors[i],
          })),
        );

        // Density Categories
        const levels = {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        };

        points.forEach((p) => {
          const d = p.density_percentage || 0;

          if (d >= 85) levels.critical++;
          else if (d >= 70) levels.high++;
          else if (d >= 50) levels.medium++;
          else levels.low++;
        });

        const total = points.length || 1;

        setDensityData([
          {
            label: "Low",
            value: (levels.low / total) * 100,
            color: "#22c55e",
          },
          {
            label: "Medium",
            value: (levels.medium / total) * 100,
            color: "#f59e0b",
          },
          {
            label: "High",
            value: (levels.high / total) * 100,
            color: "#f97316",
          },
          {
            label: "Critical",
            value: (levels.critical / total) * 100,
            color: "#ef4444",
          },
        ]);
      }

      // Top locations from cameras
      if (
        camerasRes.status === "fulfilled" &&
        camerasRes.value?.data?.cameras
      ) {
        // Density distribution
        const levels = { low: 0, medium: 0, high: 0, critical: 0 };
        cameras.forEach((c) => {
          const d = c.density_percentage || 0;
          if (d >= 85) levels.critical++;
          else if (d >= 70) levels.high++;
          else if (d >= 50) levels.medium++;
          else levels.low++;
        });
        const total = cameras.length || 1;
        setDensityData([
          { label: "Low", value: (levels.low / total) * 100, color: "#22c55e" },
          {
            label: "Medium",
            value: (levels.medium / total) * 100,
            color: "#f59e0b",
          },
          {
            label: "High",
            value: (levels.high / total) * 100,
            color: "#f97316",
          },
          {
            label: "Critical",
            value: (levels.critical / total) * 100,
            color: "#ef4444",
          },
        ]);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // every 30 sec

    return () => clearInterval(interval);
  }, [range]);

  const statCards = [
    {
      label: "Total Detections",
      value: analytics?.total_detections?.toLocaleString() || "—",
      change: analytics ? "↗ Historical" : "Loading...",
      pos: true,
    },
    {
      label: "Peak Density",
      value: analytics?.peak_system_density
        ? `${Math.round(analytics.peak_system_density)}%`
        : "—",
    },
    {
      label: "Avg Density",
      value: analytics?.average_system_density
        ? `${Math.round(analytics.average_system_density)}%`
        : "—",
    },
    {
      label: "Total Alerts",
      value: alertAnalytics?.total_alerts?.toString() || "—",
      change: alertAnalytics
        ? `↘ ${alertAnalytics.resolved_alerts || 0} resolved`
        : "Loading...",
      pos: true,
    },
  ];

  return (
    <PageWrapper>
      <TopBar
        title="Analytics Overview"
        subtitle="Detailed insights and trends"
      />
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white/5 border border-white/10 dark:text-slate-300 text-black text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500/40"
          >
            {["Last 7 Days", "Last 30 Days", "Last 90 Days"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 p-5 hover:border-white/15 transition-all"
              style={{
                background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)",
              }}
            >
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">
                {s.label}
              </div>
              <div className="text-white font-bold text-2xl">{s.value}</div>
              <div
                className={`text-xs mt-1 ${s.pos ? "text-green-400" : "text-orange-400"}`}
              >
                {s.change}
              </div>
            </div>
          ))}
        </div>

        <SectionCard title="Density Trend">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-slate-500">
              Loading...
            </div>
          ) : (
            <LineChart
              data={
                temporalData.length > 0
                  ? temporalData
                  : [
                      { date: "Mon", value: 45 },
                      { date: "Tue", value: 52 },
                      { date: "Wed", value: 48 },
                      { date: "Thu", value: 63 },
                      { date: "Fri", value: 58 },
                      { date: "Sat", value: 71 },
                      { date: "Sun", value: 65 },
                    ]
              }
            />
          )}
        </SectionCard>

        <div className="grid grid-cols-2 gap-4">
          <SectionCard title="Top Locations by Density">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center text-slate-500 py-4">
                  Loading...
                </div>
              ) : topLocations.length > 0 ? (
                topLocations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                    <span className="dark:text-slate-400 text-slate-800 text-sm flex-1">
                      {loc.name}
                    </span>
                    <div className="w-24 bg-white/5 rounded-full h-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${loc.value}%`,
                          backgroundColor: loc.color,
                          boxShadow: `0 0 8px ${loc.color}80`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold w-8 text-right"
                      style={{ color: loc.color }}
                    >
                      {loc.value}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-4">
                  No camera data
                </div>
              )}
            </div>
          </SectionCard>
          <SectionCard title="Density by Category">
            <div className="flex items-center gap-6">
              {loading ? (
                <div className="dark:text-slate-500 text-slate-800">Loading...</div>
              ) : (
                <>
                  <MiniDonut
                    data={
                      densityData.length > 0
                        ? densityData
                        : [
                            { label: "Low", value: 25, color: "#22c55e" },
                            { label: "Medium", value: 25, color: "#f59e0b" },
                            { label: "High", value: 25, color: "#f97316" },
                            { label: "Critical", value: 25, color: "#ef4444" },
                          ]
                    }
                  />
                  <div className="space-y-2">
                    {(densityData.length > 0
                      ? densityData
                      : [
                          { label: "Low", value: 25, color: "#22c55e" },
                          { label: "Medium", value: 25, color: "#f59e0b" },
                          { label: "High", value: 25, color: "#f97316" },
                          { label: "Critical", value: 25, color: "#ef4444" },
                        ]
                    ).map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: d.color,
                            boxShadow: `0 0 6px ${d.color}`,
                          }}
                        />
                        <span className="dark:text-slate-400 text-slate-800 text-xs">
                          {d.label}
                        </span>
                        <span className="dark:text-white text-slate-800 text-xs font-bold ml-auto pl-6">
                          {d.value.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}
