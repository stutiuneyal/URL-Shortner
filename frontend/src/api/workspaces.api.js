import http from "./http";

export const createWorkspace = (name) => http.post('/api/workspaces/create',{name}).then(r=>r.data)
export const listWorkspaces = () => http.get('/api/workspaces/list').then(r=>r.data);
export const getWorkspace = (id) => http.get(`/api/workspaces/list/${id}`).then(r=>r.data);