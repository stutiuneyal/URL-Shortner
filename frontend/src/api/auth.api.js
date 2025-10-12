import http from "./http";

export const register = (payload) => http.post('/api/auth/register',payload).then(r => r.data)
export const login = (payload) => http.post('/api/auth/login',payload).then(r => r.data)