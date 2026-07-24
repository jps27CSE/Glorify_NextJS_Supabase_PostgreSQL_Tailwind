"use client";

import { useState } from "react";
import Link from "next/link";
import { Song } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import EditModal from "./EditModal";
import DeleteModal from "./DeleteModal";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

interface AdminContentProps {
  songs: Song[];
  fileSizes?: Record<string, number>;
}

const formatBytes = (bytes: number) => {
  if (bytes <= 0) return "-";
  const units = ["B", "KB", "MB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 2);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const AdminContent: React.FC<AdminContentProps> = ({ songs, fileSizes }) => {
  const supabaseClient = useSupabaseClient();
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSong, setDeleteSong] = useState<Song | null>(null);
  const [search, setSearch] = useState("");

  const filteredSongs = songs.filter(
    (song) =>
      song.title?.toLowerCase().includes(search.toLowerCase()) ||
      song.author?.toLowerCase().includes(search.toLowerCase())
  );

  const getImageUrl = (song: Song) => {
    if (!song.image_path) return null;
    const { data } = supabaseClient.storage
      .from("images")
      .getPublicUrl(song.image_path);
    return data.publicUrl;
  };

  const formatDate = (song: Song) => {
    const date = (song as any).created_at;
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>
        <Link
          href="/admin/upload"
          className="flex items-center gap-x-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-lg transition text-sm"
        >
          <FiPlus size={16} />
          Add Song
        </Link>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[44px_1fr_1fr_100px_100px_120px] gap-3 px-4 py-3 bg-neutral-950 border-b border-neutral-800 text-neutral-500 text-xs font-medium uppercase tracking-wider">
          <div></div>
          <div>Title</div>
          <div>Author</div>
          <div>Size</div>
          <div>Added</div>
          <div className="text-center">Actions</div>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <p className="text-sm font-medium">
              {search ? "No songs match your search" : "No songs yet"}
            </p>
            <p className="text-xs mt-1 text-neutral-600">
              {search ? "Try a different search term" : "Upload your first song"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredSongs.map((song) => {
              const imageUrl = getImageUrl(song);
              const songSize = song.song_path
                ? fileSizes?.[`songs/${song.song_path}`] ?? 0
                : 0;
              return (
                <div
                  key={song.id}
                  className="grid grid-cols-[44px_1fr] md:grid-cols-[44px_1fr_1fr_100px_100px_120px] gap-3 px-4 py-2.5 items-center hover:bg-neutral-800/50 transition"
                >
                  <div>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                        ♪
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-500 truncate block md:hidden">
                      {song.author}
                    </p>
                  </div>

                  <div className="hidden md:block min-w-0">
                    <p className="text-sm text-neutral-400 truncate">
                      {song.author}
                    </p>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-sm text-neutral-400 font-mono">
                      {formatBytes(songSize)}
                    </p>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-sm text-neutral-500">{formatDate(song)}</p>
                  </div>

                  <div className="flex items-center justify-center gap-x-1.5">
                    <button
                      onClick={() => {
                        const { data } = supabaseClient.storage
                          .from("songs")
                          .getPublicUrl(song.song_path);
                        const a = document.createElement("a");
                        a.href = data.publicUrl;
                        a.download = `${song.title} - ${song.author}.mp3`;
                        a.click();
                      }}
                      className="p-1.5 rounded-md bg-neutral-800 hover:bg-blue-600/20 text-neutral-400 hover:text-blue-400 transition"
                      title="Download"
                    >
                      <FiDownload size={13} />
                    </button>
                    <button
                      onClick={() => setEditSong(song)}
                      className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                      title="Edit"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteSong(song)}
                      className="p-1.5 rounded-md bg-neutral-800 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteSong && (
        <DeleteModal
          isOpen={!!deleteSong}
          onClose={() => setDeleteSong(null)}
          song={deleteSong}
          imageUrl={getImageUrl(deleteSong)}
        />
      )}

      {editSong && (
        <EditModal
          isOpen={!!editSong}
          onClose={() => setEditSong(null)}
          song={editSong}
        />
      )}
    </>
  );
};

export default AdminContent;