import { create } from "zustand";

export const useTapStore = create((set) => ({
  activeId: "memo",
  preferences: {},
  setActive: (activeId) => set({ activeId }),
  setPreference: (tapId, key, value) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        [tapId]: {
          ...(state.preferences[tapId] ?? {}),
          [key]: value,
        },
      },
    })),
}));
