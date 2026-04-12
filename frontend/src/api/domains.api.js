import http from "./http";

function isUnsupportedEndpoint(error) {
    const status = error?.response?.status;
    return status === 404 || status === 405 || status === 501;
}

export const listDomains = async (workspaceId) => {
    if (!workspaceId) return [];

    try {
        const response = await http.get("/api/domains/list", {
            params: { workspace_id: workspaceId }
        });
        return response.data || [];
    } catch (error) {
        if (isUnsupportedEndpoint(error)) {
            return [];
        }
        throw error;
    }
};

export const createDomain = async (payload) => {
    try {
        const response = await http.post("/api/domains/create", payload);
        return response.data;
    } catch (error) {
        if (isUnsupportedEndpoint(error)) {
            const friendly = new Error("Domain management is still being set up.");
            friendly.code = "DOMAIN_BACKEND_NOT_READY";
            throw friendly;
        }
        throw error;
    }
};

export const verifyDomain = async (id) => {
    try {
        const response = await http.post(`/api/domains/verify/${id}`);
        return response.data;
    } catch (error) {
        if (isUnsupportedEndpoint(error)) {
            const friendly = new Error("Domain verification backend is not implemented yet.");
            friendly.code = "DOMAIN_BACKEND_NOT_READY";
            throw friendly;
        }
        throw error;
    }
};

export const deleteDomain = async (id) => {
    try {
        const response = await http.delete(`/api/domains/delete/${id}`);
        return response.data;
    } catch (error) {
        if (isUnsupportedEndpoint(error)) {
            const friendly = new Error("Domain deletion backend is not implemented yet.");
            friendly.code = "DOMAIN_BACKEND_NOT_READY";
            throw friendly;
        }
        throw error;
    }
};