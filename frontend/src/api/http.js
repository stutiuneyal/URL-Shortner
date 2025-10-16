import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { App as AntdApp } from "antd";


const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091',
});

export function setupAxiosInterceptors() {

    const {message} = AntdApp.useApp()

    http.interceptors.request.use((config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    http.interceptors.response.use(
        (res) => res,
        (err) => {
            const status = err?.response?.status;
            const msg = err?.response?.data?.error || err.message || 'Request Failed';
            if (status === 401) {
                useAuthStore.getState().logout();
                message.error(msg);
            } else if (status === 429) {
                message.error('Too many requests. Slow down a bit.');
            } else {
                message.error(msg);
            }

            return Promise.reject(err);
        }
    )
}

export default http;