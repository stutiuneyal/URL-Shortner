import http from "./http";

export const createLink = (payload) => http.post('/api/links/create',payload).then(r=>r.data)
export const listLinks = (workspace_id) => http.get('/api/links/list', { params: { workspace_id }}).then(r=>r.data);
export const updateLink = (id, patch) => http.patch(`/api/links/update/${id}`, patch).then(r=>r.data);
export const deleteLink = (id) => http.delete(`/api/links/delete/${id}`);