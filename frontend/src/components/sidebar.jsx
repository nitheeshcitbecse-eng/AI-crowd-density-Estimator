import {
  LayoutDashboard, Video, Map, BarChart2, Bell,
  FileText, MapPin, Settings, LogOut, Shield,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const NAV = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { id: "monitoring", label: "Live Monitoring",  icon: Video           },
  { id: "heatmap",    label: "Heatmap",          icon: Map             },
  { id: "analytics",  label: "Analytics",        icon: BarChart2       },
  { id: "alerts",     label: "Alerts",           icon: Bell            },
  { id: "reports",    label: "Reports",          icon: FileText        },
  // { id: "locations",  label: "Locations",        icon: MapPin          },
  { id: "settings",   label: "Settings",         icon: Settings        },
];

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed, onLogout }) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 border-r border-white/5 ${collapsed ? "w-16" : "w-64"}`}
      style={{ background: "linear-gradient(180deg,#080c1a 0%,#0a0f20 100%)", boxShadow: "4px 0 30px rgba(0,0,0,0.4)" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
          <Shield size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm tracking-wide">CrowdGuard</div>
            <div className="text-[10px] text-slate-500 tracking-wider">Privacy First, Safety Always</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button key={id} onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
                ${active ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20"
                         : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r-full" />}
              <Icon size={18} className={`flex-shrink-0 ${active ? "text-cyan-400" : ""}`} />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
              {id === "alerts" && !collapsed && (
                <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">7</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all duration-200">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}