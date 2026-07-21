import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerStore {
  ids: string[];
  activeId?: string;
  isShuffle: boolean;
  originalIds: string[];
  isUserInitiated: boolean;
  setIsUserInitiated: (value: boolean) => void;
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  reset: () => void;
  toggleShuffle: () => void;
  shuffleIds: () => void;
}

const usePlayer = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ids: [],
      activeId: undefined,
      isShuffle: false,
      originalIds: [],
      isUserInitiated: false,
      setIsUserInitiated: (value: boolean) => set({ isUserInitiated: value }),
      setId: (id: string) => set({ activeId: id }),
      setIds: (ids: string[]) => set({ ids: ids, originalIds: ids }),
      reset: () => set({ ids: [], activeId: undefined, isShuffle: false, originalIds: [] }),
      toggleShuffle: () => {
        const { isShuffle, ids, originalIds, activeId } = get();
        if (!isShuffle) {
          const otherSongs = ids.filter(id => id !== activeId);
          const shuffledOthers = otherSongs.sort(() => Math.random() - 0.5);
          const newIds = activeId ? [activeId, ...shuffledOthers] : shuffledOthers;
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
    }),
    {
      name: "player-storage",
      partialize: (state) => ({ activeId: state.activeId }),
      onRehydrateStorage: () => (state) => {
        state?.setIsUserInitiated(false);
      },
    }
  )
);

export default usePlayer;
