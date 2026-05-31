import { useState, useEffect } from "react";
import { TopBar, StatCard, SectionCard, DensityBar, PageWrapper } from "../components/UI";
import { api } from "../Services/api";
import { RefreshCw } from "lucide-react";
import "../utils/leafletIcon";
import MiniMap from "../components/MiniMap";

function DonutChart({ data }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s,d)=>s+d.value,0);
  let offset = 0;
  const r=70,cx=90,cy=90,stroke=22,circ=2*Math.PI*r;
  return (
    <div className="flex items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
        {data.map((d,i)=>{
          const dash=(d.value/total)*circ;
          const el=(
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset}
              style={{transform:"rotate(-90deg)",transformOrigin:"90px 90px",filter:`drop-shadow(0 0 4px ${d.color}80)`}}/>
          );
          offset+=dash; return el;
        })}
        <text x={cx} y={cy-6} textAnchor="middle" fill="#64748b" fontSize="20" fontWeight="700">{total.toFixed(0)}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="#64748b" fontSize="10">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map((d,i)=>(
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:d.color,boxShadow:`0 0 6px ${d.color}`}}/>
            <span className="dark:text-slate-400 text-slate-800 text-xs">{d.label}</span>
            <span className="dark:text-white text-black text-xs font-bold ml-auto pl-4">{d.value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLocations: 0,
    liveFeeds: 0,
    highDensityAlerts: 0,
    avgDensity: 0
  });
  const [cameras, setCameras] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [densityData, setDensityData] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, camerasRes, alertsRes, heatmapRes] = await Promise.allSettled([
        api.getSystemAnalytics(56), //56 hours
        api.listCameras({ limit: 20 }),
        api.getAlerts({ limit: 5, status: "active" }),
        api.getHeatmapData({ period_hours: 56 }) // 56 hours
      ]);

      // console.log(analyticsRes, camerasRes, alertsRes, heatmapRes);

      // Analytics data
      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data?.success) {
        const data = analyticsRes.value.data.data;
        setStats({
          totalLocations: data.total_cameras || 0,
          liveFeeds: data.active_cameras || 0,
          highDensityAlerts: (data.critical_events || 0) + (data.high_events || 0),
          avgDensity: data.peak_system_density || 0
        });
      }

      // Camera data
      if (camerasRes.status === "fulfilled" && camerasRes.value?.data?.cameras) {
        setCameras(camerasRes.value.data.cameras);
      }

      // Alerts data
      if (alertsRes.status === "fulfilled" && alertsRes.value?.data?.alerts) {
        setRecentAlerts(alertsRes.value.data.alerts);
      }

      // Heatmap data for density distribution
      if (heatmapRes.status === "fulfilled" && heatmapRes.value?.data?.data) {
        const points = heatmapRes.value.data.data.points;
        const densityLevels = { low: 0, medium: 0, high: 0, critical: 0 };
        points.forEach(p => {
          const d = p.density_percentage || 0;
          if (d >= 85) densityLevels.critical++;
          else if (d >= 70) densityLevels.high++;
          else if (d >= 50) densityLevels.medium++;
          else densityLevels.low++;
        });
        const total = points.length || 1;
        setDensityData([
          { label: "Low (<50%)", value: (densityLevels.low / total) * 100, color: "#22c55e" },
          { label: "Medium (50-70)% ", value: (densityLevels.medium / total) * 100, color: "#f59e0b" },
          { label: "High (70-85%)", value: (densityLevels.high / total) * 100, color: "#f97316" },
          { label: "Critical (>85%)", value: (densityLevels.critical / total) * 100, color: "#ef4444" }
        ]);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { icon:"📍", label:"Total Locations",    value:stats.totalLocations,     sub: loading ? "Loading..." : "Cameras registered", subColor:"text-green-400"  },
    { icon:"📡", label:"Live Feeds",         value:stats.liveFeeds,          sub: loading ? "Loading..." : "Active now",         subColor:"text-green-400"  },
    { icon:"⚠️", label:"High Density Alerts",value:stats.highDensityAlerts,  sub: loading ? "Loading..." : "Active now",         subColor:"text-red-400"    },
    { icon:"📊", label:"Avg Density",        value:`${Math.round(stats.avgDensity)}%`,   sub: loading ? "Loading..." : "Last 24 hours",  subColor:"text-orange-400" },
  ];

  const levelColors = {
    critical:{ bg:"bg-red-500/10",    border:"border-red-500/20",    dot:"bg-red-500",    text:"text-red-400"    },
    high:    { bg:"bg-orange-500/10", border:"border-orange-500/20", dot:"bg-orange-500", text:"text-orange-400" },
    moderate:{ bg:"bg-yellow-500/10", border:"border-yellow-500/20", dot:"bg-yellow-500", text:"text-yellow-400" },
    low:     { bg:"bg-green-500/10",  border:"border-green-500/20",  dot:"bg-green-500",  text:"text-green-400"  },
  };

  return (
    <PageWrapper>
      <TopBar title="Dashboard" subtitle="Real-time overview of crowd density across all locations"/>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-4 gap-4 flex-1">
            {statCards.map((c,i)=><StatCard key={i} {...c}/>)}
          </div>
          <button
            onClick={fetchDashboardData}
            className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border dark:border-white/8 border-black dark:text-slate-400 text-black hover:text-white text-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <SectionCard title="Live Overview" className="col-span-3">
              <MiniMap cameras={cameras} />
          </SectionCard>
          <SectionCard title="Density Distribution" className="col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-slate-500">Loading...</span>
              </div>
            ) : (
              <DonutChart data={densityData.length > 0 ? densityData : [
                { label: "Low", value: 30, color: "#22c55e" },
                { label: "Medium", value: 10, color: "#f59e0b" },
                { label: "High", value: 35, color: "#f97316" },
                { label: "Critical", value: 25, color: "#ef4444" }
              ]}/>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Recent Alerts" actionLabel="View All Alerts →">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-slate-500">Loading alerts...</span>
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-slate-500">No active alerts</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentAlerts.map(a=>{
                const severity = a.severity || "low";
                const c = levelColors[severity] || levelColors.low;
                return (
                  <div key={a._id} className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`}/>
                      <div>
                        <div className="dark:text-white text-black text-sm font-semibold">{a.camera_name || "Unknown Camera"}</div>
                        <div className={`text-xs ${c.text}`}>{a.type || a.severity}</div>
                      </div>
                      <span className={`ml-auto text-xl font-bold ${c.text}`}>{a.density_percentage || 0}%</span>
                    </div>
                    <DensityBar value={a.density_percentage || 0}/>
                    <div className="text-slate-600 text-[10px] mt-2">{a.location || "Unknown location"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </PageWrapper>
  );
}