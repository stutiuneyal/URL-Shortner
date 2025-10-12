import { create } from "zustand";

const WS_KEY = 'ws-v1';

export const useWsStore = create((set, get) => ({
  current: null,
  list: [],
  setList: (list) => set({ list }),
  setCurrent: (ws) => {
    set({ current: ws });
    localStorage.setItem(WS_KEY, JSON.stringify(ws));
  },
  init: () => {
    try {
      const raw = localStorage.getItem(WS_KEY);
      if (raw) set({ current: JSON.parse(raw) });
    } catch {}
  }
}));