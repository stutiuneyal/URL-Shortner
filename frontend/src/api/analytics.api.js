import http from "./http";

export const getSummary = (workspace_id) => http.get('/api/analytics/summary',{params: {workspace_id}}).then(r=>r.data)