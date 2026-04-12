import { create } from "zustand";

const LOCAL_KEY = "auth-v2";

function safeReadAuth() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistAuth(auth) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(auth))
}

function clearPersistedAuth() {
    localStorage.removeItem(LOCAL_KEY)
}

export const useAuthStore = create((set, get) => ({
    hydrated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,

    init: () => {
        const auth = safeReadAuth();
        if (auth?.user && auth?.accessToken) {
            set({
                hydrated: true,
                user: auth.user || null,
                accessToken: auth.accessToken || null,
                refreshToken: auth.refreshToken || null,
                accessTokenExpiresAt: auth.accessTokenExpiresAt || null
            });
            return;
        }

        set({
            hydrated: true,
            user: null,
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null
        });
    },

    login: ({ user, tokens }) => {
        const nextAuth = {
            user: user || null,
            accessToken: tokens?.accessToken || null,
            refreshToken: tokens?.refreshToken || null,
            accessTokenExpiresAt: tokens?.accessTokenExpiresAt || null
        };

        set({
            hydrated: true,
            ...nextAuth
        });

        persistAuth(nextAuth)

    },

    updateAccessToken: ({ accessToken, accessTokenExpiresAt }) => {
        const state = get();

        const nextAuth = {
            user: state.user,
            accessToken: accessToken || null,
            refreshToken: state.refreshToken,
            accessTokenExpiresAt: accessTokenExpiresAt || null
        };

        set(nextAuth);
        persistAuth(nextAuth);
    },

    logout: () => {
        set({
            hydrated: true,
            user: null,
            accessToken: null,
            refreshToken: null,
            accessTokenExpiresAt: null
        });

        clearPersistedAuth();
    }
}));