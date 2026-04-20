import http from "./http";

export const listLinks = async (workspaceId) => {
    const response = await http.get("/api/links/list", {
        params: { workspace_id: workspaceId }
    });
    return response.data || [];
};

export const getLinkById = async (id) => {
    const response = await http.get(`/api/links/${id}`);
    return response.data;
};

export const createLink = async (payload) => {
    const response = await http.post("/api/links/create", payload);
    return response.data;
};

export const updateLink = async (id, payload) => {
    const response = await http.patch(`/api/links/update/${id}`, payload);
    return response.data;
};

export const deleteLink = async (id) => {
    const response = await http.delete(`/api/links/delete/${id}`);
    return response.data;
};

export const pauseLink = async (id) => {
    const response = await http.post(`/api/links/${id}/pause`);
    return response.data;
};

export const resumeLink = async (id) => {
    const response = await http.post(`/api/links/${id}/resume`);
    return response.data;
};

export const archiveLink = async (id) => {
    const response = await http.post(`/api/links/${id}/archive`);
    return response.data;
};

export const unarchiveLink = async (id) => {
    const response = await http.post(`/api/links/${id}/unarchive`);
    return response.data;
};

export const getSlugSuggestions = async (payload) => {
    const response = await http.post("/api/links/slug-suggestions", payload);
    return response.data;
};