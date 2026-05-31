import { apiClient } from "./apiClient";

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  login: (email, password) =>
    apiClient.post("/api/auth/login", { email, password }),

  register: (name, email, password, role = "user") =>
    apiClient.post("/api/auth/register", { name, email, password, role }),

  logout: () => apiClient.post("/api/auth/logout"),

  me: () => apiClient.get("/api/auth/me"),

  // ── Cameras ───────────────────────────────────────────────────────────────────
  listCameras: (params = {}) =>
    apiClient.get("/api/cameras/", { params }),

  getCamera: (id) =>
    apiClient.get(`/api/cameras/${id}`),

  createCamera: (data) =>
    apiClient.post("/api/cameras/", data),

  updateCamera: (id, data) =>
    apiClient.put(`/api/cameras/${id}`, data),

  deleteCamera: (id) =>
    apiClient.delete(`/api/cameras/${id}`),

  // ── Detections ───────────────────────────────────────────────────────────────
  getLiveDetections: () =>
    apiClient.get("/api/detections/live"),

  getDetectionHistory: (cameraId, limit = 50) =>
    apiClient.get(`/api/detections/${cameraId}/history`, { params: { limit } }),

  getDetectionTrends: (cameraId, hours = 24) =>
    apiClient.get(`/api/detections/${cameraId}/trends`, { params: { hours } }),

  createDetection: (data) =>
    apiClient.post("/api/detections/", data),

  // ── Alerts ───────────────────────────────────────────────────────────────────
  getAlerts: ({ status, severity, camera_id, limit = 50, skip = 0 } = {}) =>
    apiClient.get("/api/alerts/", {
      params: { status, severity, camera_id, limit, skip },
    }),

  getAlertStats: (period_hours = 24) =>
    apiClient.get("/api/alerts/statistics", { params: { period_hours } }),

  getAlert: (id) =>
    apiClient.get(`/api/alerts/${id}`),

  resolveAlert: (id, note) =>
    apiClient.post(`/api/alerts/${id}/resolve`, { note, resolution_status: "resolved" }),

  acknowledgeAlert: (id, note) =>
    apiClient.post(`/api/alerts/${id}/acknowledge`, { note }),

  dismissAlert: (id, reason) =>
    apiClient.post(`/api/alerts/${id}/dismiss`, { reason }),

  bulkResolveAlerts: (alertIds, note) =>
    apiClient.post(`/api/alerts/bulk/resolve?note=${encodeURIComponent(note || "")}`, { alert_ids: alertIds }),

  // ── Heatmap ──────────────────────────────────────────────────────────────────
  getHeatmapData: ({ period_hours = 24, camera_ids } = {}) =>
    apiClient.get("/api/heatmap/data", {
      params: { period_hours, camera_ids },
    }),

  getHeatmapSummary: (period_hours = 24) =>
    apiClient.get("/api/heatmap/summary", { params: { period_hours } }),

  getHeatmapZonesRisk: (period_hours = 24) =>
    apiClient.get("/api/heatmap/zones/risk", { params: { period_hours } }),

  getHeatmapCameraHistory: (cameraId, period_hours = 24) =>
    apiClient.get(`/api/heatmap/camera/${cameraId}/history`, { params: { period_hours } }),

  getHeatmapCameraTrends: (cameraId, period_hours = 24, interval_minutes = 60) =>
    apiClient.get(`/api/heatmap/camera/${cameraId}/trends`, { params: { period_hours, interval_minutes } }),

  getHeatmapStatsLive: () =>
    apiClient.get("/api/heatmap/stats/live"),

  // ── Analytics ─────────────────────────────────────────────────────────────────
  getSystemAnalytics: (period_hours = 24) =>
    apiClient.get("/api/analytics/system", { params: { period_hours } }),

  getCameraAnalytics: (cameraId, period_hours = 24) =>
    apiClient.get(`/api/analytics/camera/${cameraId}`, { params: { period_hours } }),

  getTemporalAnalytics: (period_hours = 24, granularity = "hourly", camera_id) =>
    apiClient.get("/api/analytics/temporal", {
      params: { period_hours, granularity, camera_id },
    }),

  compareCameras: (cameraId1, cameraId2, period_hours = 24) =>
    apiClient.get("/api/analytics/compare", {
      params: { camera_id1: cameraId1, camera_id2: cameraId2, period_hours },
    }),

  getAlertAnalytics: (period_hours = 24) =>
    apiClient.get("/api/analytics/alerts", { params: { period_hours } }),

  // ── Privacy ───────────────────────────────────────────────────────────────────
  getComplianceReport: (report_period = "monthly") =>
    apiClient.get("/api/privacy/compliance/report", { params: { report_period } }),

  getDataRetentionPolicy: () =>
    apiClient.get("/api/privacy/data-retention/policy"),

  getAuditLogs: (user_id, limit = 100, skip = 0) =>
    apiClient.get("/api/privacy/audit-logs", { params: { user_id, limit, skip } }),

  getAccessLogs: (endpoint, period_hours = 24, limit = 100) =>
    apiClient.get("/api/privacy/access-logs", { params: { endpoint, period_hours, limit } }),

  getAnonymizationStatus: () =>
    apiClient.get("/api/privacy/anonymization/status"),

  exportUserData: () =>
    apiClient.post("/api/privacy/data/export"),

  requestDataDeletion: (reason) =>
    apiClient.post(`/api/privacy/data/deletion?reason=${encodeURIComponent(reason || "")}`),

  getEncryptionConfig: () =>
    apiClient.get("/api/privacy/encryption/config"),

  getAccessControlPolicies: () =>
    apiClient.get("/api/privacy/access-control/policies"),

  getDataClassification: () =>
    apiClient.get("/api/privacy/data-classification"),

  verifyCompliance: () =>
    apiClient.get("/api/privacy/compliance/verify"),
};

// ── Mock data for placeholders (UI can render while data loads) ──────────────
export const mockData = {
  stats: { totalLocations: 24, liveFeeds: 18, highDensityAlerts: 7, avgDensity: 63 },
};