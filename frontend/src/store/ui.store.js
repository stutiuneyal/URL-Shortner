import { create } from 'zustand';

export const useUiStore = create((set) => ({
    siderCollapsed: false,
    toggleSider: () => set((s) => ({ siderCollapsed: !s.siderCollapsed })),
}));