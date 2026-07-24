"use client";

import usePlayer from "@/hooks/usePlayer";
import useGetSongById from "@/hooks/useGetSongById";
import useLoadSongUrl from "@/hooks/useLoadSongUrl";
import PlayerContent from "@/components/PlayerContent";
import { useRef, useState } from "react";

const Player = () => {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId);
  const [isExpanded, setIsExpanded] = useState(false);
  const songUrl = useLoadSongUrl(song!);

  const persistedSong = useRef<typeof song>(undefined);
  const persistedUrl = useRef<string>("");

  if (song && songUrl) {
    persistedSong.current = song;
    persistedUrl.current = songUrl;
  }

  const activeSong = song || persistedSong.current;
  const activeUrl = songUrl || persistedUrl.current;

  if (!activeSong || !activeUrl || !player.activeId) {
    return null;
  }

  return (
    <div className="fixed bottom-0 bg-black w-full py-2 h-[80px] px-4">
      <PlayerContent
        song={activeSong}
        songUrl={activeUrl}
        isExpanded={isExpanded}
        onExpandChange={setIsExpanded}
      />
    </div>
  );
};
export default Player;