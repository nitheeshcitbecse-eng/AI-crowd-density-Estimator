import { useState, useEffect } from "react";
import { TopBar, PageWrapper } from "../components/UI";
import { Save } from "lucide-react";

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-cyan-500" : "bg-slate-300 dark:bg-white/10"}`}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{
          left: "2px",
          transform: enabled ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/5 last:border-0">
      <span className="text-slate-600 dark:text-slate-400 text-sm">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Settings() {
  const [privacy, setPrivacy] = useState({
    faceBlurring: true,
    dataAnonymization: true,
    storeOnlyMetadata: true,
  });
  const [alertSets, setAlertSets] = useState({
    critical: true,
    high: true,
    moderate: true,
    low: false,
  });
  // Set default to true if you want the app to start in dark mode
  const [general, setGeneral] = useState({
    darkMode: false,
    notifications: true,
    autoRefresh: 10,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (general.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [general.darkMode]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const card =
    "rounded-2xl border border-slate-200 dark:border-white/10 p-5 bg-white dark:bg-gradient-to-br dark:from-[#0d1225] dark:to-[#080c1a] shadow-sm dark:shadow-none transition-colors duration-300";

  return (
    <PageWrapper>
      <TopBar title="Settings" subtitle="Customize your system preferences" />
      <div className="p-8 space-y-6 max-w-2xl">
        {/* Privacy */}
        <div className={card}>
          <h2 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">
            Privacy Settings
          </h2>
          {[
            { key: "faceBlurring", label: "Face Blurring" },
            { key: "dataAnonymization", label: "Data Anonymization" },
            { key: "storeOnlyMetadata", label: "Store Only Metadata" },
          ].map(({ key, label }) => (
            <SettingRow key={key} label={label}>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${privacy[key] ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-600"}`}
                >
                  {privacy[key] ? "Enabled" : "Disabled"}
                </span>
                <Toggle
                  enabled={privacy[key]}
                  onChange={(v) => setPrivacy({ ...privacy, [key]: v })}
                />
              </div>
            </SettingRow>
          ))}
        </div>

        {/* Alert settings */}
        <div className={card}>
          <h2 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">
            Alert Settings
          </h2>
          {[
            {
              key: "critical",
              label: "Critical Alerts",
              color: "text-red-500 dark:text-red-400",
            },
            {
              key: "high",
              label: "High Alerts",
              color: "text-orange-500 dark:text-orange-400",
            },
            {
              key: "moderate",
              label: "Moderate Alerts",
              color: "text-yellow-600 dark:text-yellow-400",
            },
            {
              key: "low",
              label: "Low Alerts",
              color: "text-green-600 dark:text-green-400",
            },
          ].map(({ key, label, color }) => (
            <SettingRow
              key={key}
              label={<span className={color}>{label}</span>}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${alertSets[key] ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-600"}`}
                >
                  {alertSets[key] ? "On" : "Off"}
                </span>
                <Toggle
                  enabled={alertSets[key]}
                  onChange={(v) => setAlertSets({ ...alertSets, [key]: v })}
                />
              </div>
            </SettingRow>
          ))}
        </div>

        {/* General */}
        <div className={card}>
          <h2 className="text-slate-800 dark:text-white font-semibold text-sm mb-3">
            General Settings
          </h2>
          <SettingRow label="Dark Mode">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${general.darkMode ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-600"}`}
              >
                {general.darkMode ? "On" : "Off"}
              </span>
              <Toggle
                enabled={general.darkMode}
                onChange={(v) => setGeneral({ ...general, darkMode: v })}
              />
            </div>
          </SettingRow>
          <SettingRow label="Notifications">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs ${general.notifications ? "text-cyan-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-600"}`}
              >
                {general.notifications ? "On" : "Off"}
              </span>
              <Toggle
                enabled={general.notifications}
                onChange={(v) => setGeneral({ ...general, notifications: v })}
              />
            </div>
          </SettingRow>
          <SettingRow label="Auto Refresh (sec)">
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setGeneral({
                    ...general,
                    autoRefresh: Math.max(0, general.autoRefresh - 1),
                  })
                }
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-sm transition-colors"
              >
                −
              </button>
              <span className="text-slate-800 dark:text-white text-sm font-medium w-8 text-center">
                {general.autoRefresh}
              </span>
              <button
                onClick={() =>
                  setGeneral({
                    ...general,
                    autoRefresh: general.autoRefresh + 1,
                  })
                }
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 text-sm transition-colors"
              >
                +
              </button>
            </div>
          </SettingRow>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${saved ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30" : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20"}`}
        >
          <Save size={16} />
          {saved ? "✓ Saved Successfully" : "Save Settings"}
        </button>
      </div>
    </PageWrapper>
  );
}
