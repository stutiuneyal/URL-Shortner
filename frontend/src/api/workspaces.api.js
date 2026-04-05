import http from "./http";

export const createWorkspace = async (name) => {
    const response = await http.post("/api/workspaces/create", { name });
    return response.data;
};

export const listWorkspaces = async () => {
    const response = await http.get("/api/workspaces/list");
    return response.data || [];
};

export const getWorkspace = async (id) => {
    const response = await http.get(`/api/workspaces/list/${id}`);
    return response.data;
};