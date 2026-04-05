import http from "./http";

export const getSummary = async (workspaceId) => {
    const response = await http.get("/api/analytics/summary", {
        params: { workspace_id: workspaceId }
    });
    return response.data || {};
};

export const getDashboardAnalytics = async (workspaceId) => {
    const response = await http.get("/api/analytics/dashboard", {
        params: { workspace_id: workspaceId }
    });
    return response.data || {};
};

export const getLinkAnalytics = async (linkId) => {
    const response = await http.get(`/api/analytics/link/${linkId}`);
    return response.data || {};
};

export const exportLinkAnalyticsCsv = async (linkId) => {
    const response = await http.get(`/api/analytics/export/link/${linkId}`, {
        responseType: "blob"
    });
    return response.data;
};