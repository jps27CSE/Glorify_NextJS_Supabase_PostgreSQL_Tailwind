import { create } from "zustand";

interface PlayerStore {
  ids: string[];
  activeId?: string;
  isShuffle: boolean;
  originalIds: string[];
  setId: (id: string) => void;
  setIds: (ids: string[]) => void;
  reset: () => void;
  toggleShuffle: () => void;
  shuffleIds: () => void;
}

const usePlayer = create<PlayerStore>((set, get) => ({
  ids: [],
  activeId: undefined,
  isShuffle: false,
  originalIds: [],
  setId: (id: string) => set({ activeId: id }),
  setIds: (ids: string[]) => set({ ids: ids, originalIds: ids }),
  reset: () => set({ ids: [], activeId: undefined, isShuffle: false, originalIds: [] }),
  toggleShuffle: () => {
    const { isShuffle, ids, originalIds, activeId } = get();
    if (!isShuffle) {
      // Enable shuffle - keep current song at current position, shuffle others
      const otherSongs = ids.filter(id => id !== activeId);
      const shuffledOthers = otherSongs.sort(() => Math.random() - 0.5);
      const newIds = activeId ? [activeId, ...shuffledOthers] : shuffledOthers;
      set({ isShuffle: true, ids: newIds });
    } else {
      // Disable shuffle
      set({ isShuffle: false, ids: originalIds });
    }
  },
  shuffleIds: () => {
    const { ids } = get();
    const shuffledIds = [...ids].sort(() => Math.random() - 0.5);
    set({ ids: shuffledIds });
  },
}));

export default usePlayer;
