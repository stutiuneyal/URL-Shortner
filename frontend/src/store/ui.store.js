import { create } from "zustand";

function createToastId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useUiStore = create((set) => ({
    siderCollapsed: false,
    toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),

    toasts: [],

    pushToast: ({ title, description = "", type = "info", duration = 3200 }) => {
        const id = createToastId();
        const toast = { id, title, description, type, duration };

        set((state) => ({
            toasts: [...state.toasts, toast]
        }));

        if (duration > 0) {
            window.setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((item) => item.id !== id)
                }));
            }, duration);
        }

        return id;
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((item) => item.id !== id)
        }))
}));