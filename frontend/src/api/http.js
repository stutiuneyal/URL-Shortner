import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { useUiStore } from "../store/ui.store";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8091"
});

let interceptorsSetup = false;

export function setupAxiosInterceptors() {
    if (interceptorsSetup) return;
    interceptorsSetup = true;

    http.interceptors.request.use(
        (config) => {
            const token = useAuthStore.getState().token;

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    http.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error?.response?.status;
            const serverMessage =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                "Request failed";

            const pushToast = useUiStore.getState().pushToast;

            if (status === 401) {
                useAuthStore.getState().logout();
                pushToast({
                    type: "error",
                    title: "Session expired",
                    description: serverMessage || "Please sign in again."
                });
            } else if (status === 429) {
                pushToast({
                    type: "warning",
                    title: "Too many requests",
                    description: "Slow down a little and try again."
                });
            } else {
                pushToast({
                    type: "error",
                    title: "Something went wrong",
                    description: serverMessage
                });
            }

            return Promise.reject(error);
        }
    );
}

export default http;