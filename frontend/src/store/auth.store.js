import { create } from "zustand";

const LOCAL_KEY = "auth-v1";

function safeReadAuth() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export const useAuthStore = create((set) => ({
    user: null,
    token: null,

    init: () => {
        const auth = safeReadAuth();
        if (auth?.user && auth?.token) {
            set({
                user: auth.user,
                token: auth.token
            });
        }
    },

    login: ({ user, tokens }) => {
        const accessToken = tokens?.accessToken || null;

        set({
            user: user || null,
            token: accessToken
        });

        localStorage.setItem(
            LOCAL_KEY,
            JSON.stringify({
                user: user || null,
                token: accessToken
            })
        );
    },

    logout: () => {
        set({
            user: null,
            token: null
        });

        localStorage.removeItem(LOCAL_KEY);
    }
}));