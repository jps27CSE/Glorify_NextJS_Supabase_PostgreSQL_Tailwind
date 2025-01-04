"use client";
import React, { useEffect, useState } from "react";
import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import useUploadModal from "@/hooks/useUploadModal";
import { Song } from "@/types";
import MediaItem from "@/components/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface LibraryProps {
  songs: Song[];
}

const Library: React.FC<LibraryProps> = ({ songs: allSongs }) => {
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const onPlay = useOnPlay(allSongs);
  const supabaseClient = useSupabaseClient();

  const [songs, setSongs] = useState<Song[]>([]);

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    return uploadModal.onOpen();
  };

  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user) {
        setSongs([]); // Clear songs when the user logs out
        return;
      }

      if (user.email === "admin@glorify.com") {
        // Admin sees all songs
        setSongs(allSongs);
      } else {
        // Fetch liked songs for non-admin users
        const { data, error } = await supabaseClient
          .from("liked_songs")
          .select("songs(*)") // Assuming a foreign key relationship to "songs"
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching liked songs:", error.message);
          return;
        }

        const likedSongs = data?.map((item) => item.songs) || [];
        setSongs(likedSongs);
      }
    };

    fetchLikedSongs();
  }, [user, supabaseClient, allSongs]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist className="text-neutral-400 " size={26} />
          <p className="text-neutral-400 font-medium text-md">Your Library</p>
        </div>
        {user?.email === "admin@glorify.com" && (
          <AiOutlinePlus
            onClick={onClick}
            size={20}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
        )}
      </div>
      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {songs.map((item) => (
          <MediaItem
            onClick={(id: string) => onPlay(id)}
            key={item.id}
            data={item}
          />
        ))}
      </div>
    </div>
  );
};

export default Library;
