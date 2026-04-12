import { create } from "zustand";

const STORAGE_KEY = "urlshortener-onboarding-v1";

const defaultState = {
    hasSeenWorkspaceTour: false,
    hasSeenLinkTour: false,
    hasSeenDomainTour: false,
    hasSeenDashboardTour: false,

    activeTour: null, // "workspace" | "link" | "domain" | "dashboard" | null
    isRunning: false
};

function loadPersistedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch {
        return defaultState;
    }
}

function persist(state) {
    const toPersist = {
        hasSeenWorkspaceTour: state.hasSeenWorkspaceTour,
        hasSeenLinkTour: state.hasSeenLinkTour,
        hasSeenDomainTour: state.hasSeenDomainTour,
        hasSeenDashboardTour: state.hasSeenDashboardTour
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
}

export const useOnboardingStore = create((set, get) => ({
    ...loadPersistedState(),

    startTour: (tourName) => {
        set({
            activeTour: tourName,
            isRunning: true
        });
    },

    stopTour: () => {
        set({
            activeTour: null,
            isRunning: false
        });
    },

    markTourSeen: (tourName) => {
        const updates = {};

        if (tourName === "workspace") updates.hasSeenWorkspaceTour = true;
        if (tourName === "link") updates.hasSeenLinkTour = true;
        if (tourName === "domain") updates.hasSeenDomainTour = true;
        if (tourName === "dashboard") updates.hasSeenDashboardTour = true;

        const nextState = {
            ...get(),
            ...updates
        };

        persist(nextState);
        set(updates);
    },

    resetAllTours: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
            ...defaultState
        });
    }
}));