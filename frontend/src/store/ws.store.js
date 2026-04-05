import { create } from "zustand";

const WS_KEY = "ws-v1";

function safeReadWorkspace() {
  try {
    const raw = localStorage.getItem(WS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useWsStore = create((set, get) => ({
  current: null,
  list: [],

  setList: (list) => {
    const safeList = Array.isArray(list) ? list : [];
    const current = get().current;

    let nextCurrent = current;

    if (current?.id) {
      const refreshedCurrent = safeList.find((item) => item.id === current.id);
      if (refreshedCurrent) {
        nextCurrent = refreshedCurrent;
      }
    }

    if (!nextCurrent && safeList.length) {
      nextCurrent = safeList[0];
    }

    set({
      list: safeList,
      current: nextCurrent || null
    });

    if (nextCurrent) {
      localStorage.setItem(WS_KEY, JSON.stringify(nextCurrent));
    } else {
      localStorage.removeItem(WS_KEY);
    }
  },

  setCurrent: (ws) => {
    set({ current: ws || null });

    if (ws) {
      localStorage.setItem(WS_KEY, JSON.stringify(ws));
    } else {
      localStorage.removeItem(WS_KEY);
    }
  },

  init: () => {
    const existing = safeReadWorkspace();
    if (existing) {
      set({ current: existing });
    }
  }
}));