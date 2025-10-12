import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { message } from "antd";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091',
});

http.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

http.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.error || err.message || 'Request Failed';
        if(status===401){
            useAuthStore.getState().logout();
            message.error('Session expired. Please login again.');
        } else if(status===429){
            message.error('Too many requests. Slow down a bit.');
        }else{
            message.error(msg);
        }

        return Promise.reject(err);
    }
)

export default http;