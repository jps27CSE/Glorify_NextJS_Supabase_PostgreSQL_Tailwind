import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RepeatMode = "off" | "one" | "all";

interface PlayerStore {
  ids: string[];
  activeId?: string;
  isShuffle: boolean;
  originalIds: string[];
  shouldPlay: boolean;
  repeatMode: RepeatMode;
  setShouldPlay: (value: boolean) => void;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  reset: () => void;
  toggleShuffle: () => void;
  shuffleIds: () => void;
  cycleRepeat: () => void;
}

const usePlayer = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ids: [],
      activeId: undefined,
      isShuffle: false,
      originalIds: [],
      shouldPlay: false,
      repeatMode: "off",
      setShouldPlay: (value: boolean) => set({ shouldPlay: value }),
      setId: (id: string) => set({ activeId: id }),
      setIds: (ids: string[]) => set({ ids: ids, originalIds: ids }),
      reset: () =>
        set({
          ids: [],
          activeId: undefined,
          isShuffle: false,
          originalIds: [],
        }),
      toggleShuffle: () => {
        const { isShuffle, ids, originalIds, activeId } = get();
        if (!isShuffle) {
          const otherSongs = ids.filter((id) => id !== activeId);
          const shuffledOthers = otherSongs.sort(() => Math.random() - 0.5);
          const newIds = activeId
            ? [activeId, ...shuffledOthers]
            : shuffledOthers;
          set({ isShuffle: true, ids: newIds });
        } else {
          set({ isShuffle: false, ids: originalIds });
        }
      },
      shuffleIds: () => {
        const { ids } = get();
        const shuffledIds = [...ids].sort(() => Math.random() - 0.5);
        set({ ids: shuffledIds });
      },
      cycleRepeat: () => {
        const { repeatMode } = get();
        const modes: RepeatMode[] = ["off", "all", "one"];
        const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIndex] });
      },
    }),
    {
      name: "player-storage",
      partialize: (state) => ({ activeId: state.activeId }),
    }
  )
);

export default usePlayer;