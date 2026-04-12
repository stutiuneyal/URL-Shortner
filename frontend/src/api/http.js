import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { useUiStore } from "../store/ui.store";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8091";

const http = axios.create({
    baseURL
});

let interceptorsSetup = false;
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onRefreshed(newToken) {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
}

function getReadableErrorMessage(error) {
    const status = error?.response?.status;
    const data = error?.response?.data || {};
    const serverMessage = data?.error || data?.message || "";
    const fields = data?.fields || {};

    if (status === 400) {
        if (Object.keys(fields).length > 0) {
            return Object.values(fields)[0];
        }
        return serverMessage || "Please check the entered details and try again.";
    }

    if (status === 401) {
        const normalized = String(serverMessage).toLowerCase();

        if (normalized.includes("incorrect password")) return "Incorrect password.";
        if (normalized.includes("no account found")) return "No account found with this email.";
        if (normalized.includes("invalid or expired")) return "Your session has expired. Please sign in again.";
        if (normalized.includes("session is no longer valid")) return "Your session is no longer valid. Please sign in again.";

        return serverMessage || "You need to sign in again.";
    }

    if (status === 403) {
        return serverMessage || "You do not have permission to perform this action.";
    }

    if (status === 404) {
        return serverMessage || "The requested resource was not found.";
    }

    if (status === 409) {
        return serverMessage || "An account with this email already exists.";
    }

    if (status === 429) {
        return "Too many requests. Please wait a moment and try again.";
    }

    if (!error?.response) {
        return "Unable to connect to the server. Please check your internet connection.";
    }

    return serverMessage || "Something went wrong. Please try again.";
}

async function performRefresh() {
    const auth = useAuthStore.getState();
    const refreshTokenValue = auth.refreshToken;

    if (!refreshTokenValue) {
        throw new Error("Missing refresh token");
    }

    const response = await axios.post(`${baseURL}/api/auth/refresh`, {
        refreshToken: refreshTokenValue
    });

    return response.data;
}

export function setupAxiosInterceptors() {
    if (interceptorsSetup) return;
    interceptorsSetup = true;

    http.interceptors.request.use(
        (config) => {
            const accessToken = useAuthStore.getState().accessToken;

            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    http.interceptors.response.use(
        (response) => response,
        async (error) => {
            const pushToast = useUiStore.getState().pushToast;
            const originalRequest = error.config;
            const status = error?.response?.status;

            const url = originalRequest?.url || "";
            const isAuthCall =
                url.includes("/api/auth/login") ||
                url.includes("/api/auth/register") ||
                url.includes("/api/auth/refresh");

            if (status === 401 && !isAuthCall && !originalRequest?._retry) {
                if (isRefreshing) {
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((newToken) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            resolve(http(originalRequest));
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshed = await performRefresh();

                    useAuthStore.getState().updateAccessToken({
                        accessToken: refreshed?.tokens?.accessToken,
                        accessTokenExpiresAt: refreshed?.tokens?.accessTokenExpiresAt
                    });

                    const newToken = refreshed?.tokens?.accessToken;
                    onRefreshed(newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return http(originalRequest);
                } catch (refreshError) {
                    useAuthStore.getState().logout();

                    pushToast({
                        type: "error",
                        title: "Session expired",
                        description: "Please sign in again."
                    });

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            const message = getReadableErrorMessage(error);

            if (status === 429) {
                pushToast({
                    type: "warning",
                    title: "Too many requests",
                    description: message
                });
            } else if (status === 401 && url.includes("/api/auth/login")) {
                pushToast({
                    type: "error",
                    title: "Sign in failed",
                    description: message
                });
            } else if (status === 401 && url.includes("/api/auth/register")) {
                pushToast({
                    type: "error",
                    title: "Account creation failed",
                    description: message
                });
            } else if (status === 409) {
                pushToast({
                    type: "warning",
                    title: "Account already exists",
                    description: message
                });
            } else if (!isAuthCall) {
                pushToast({
                    type: "error",
                    title: "Request failed",
                    description: message
                });
            }

            return Promise.reject(error);
        }
    );
}

export default http;