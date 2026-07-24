"use client";

import Modal from "@/components/Modal";
import Button from "@/components/Button";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { Song } from "@/types";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  imageUrl: string | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  song,
  imageUrl,
}) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!song) return;

    try {
      setIsDeleting(true);

      const deletePromises: Promise<any>[] = [];

      deletePromises.push(
        supabaseClient.from("liked_songs").delete().eq("song_id", song.id)
      );

      const { error: deleteError } = await supabaseClient
        .from("songs")
        .delete()
        .eq("id", song.id);

      if (deleteError) {
        toast.error(deleteError.message);
        return;
      }

      if (song.song_path) {
        deletePromises.push(
          supabaseClient.storage.from("songs").remove([song.song_path])
        );
      }

      if (song.image_path) {
        deletePromises.push(
          supabaseClient.storage.from("images").remove([song.image_path])
        );
      }

      await Promise.allSettled(deletePromises);

      router.refresh();
      toast.success("Song deleted");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      title="Delete Song"
      description="Are you sure you want to delete this song? This action cannot be undone."
      isOpen={isOpen}
      onChange={onChange}
    >
      {song && (
        <div className="flex flex-col items-center gap-y-4">
          <div className="flex items-center gap-x-3 w-full p-3 bg-neutral-700 rounded-lg">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={song.title}
                className="w-14 h-14 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-md bg-neutral-600 flex-shrink-0 flex items-center justify-center text-neutral-400 text-xs">
                No img
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <p className="text-white font-semibold truncate">
                {song.title}
              </p>
              <p className="text-neutral-400 text-sm truncate">
                {song.author}
              </p>
            </div>
          </div>

          <div className="w-full bg-red-500/10 border border-red-500/30 rounded-md p-3">
            <p className="text-red-400 text-sm text-center">
              This will permanently delete this song and its associated files.
            </p>
          </div>

          <div className="flex gap-x-3 w-full">
            <Button
              disabled={isDeleting}
              onClick={onClose}
              className="bg-neutral-600 text-white hover:bg-neutral-500"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DeleteModal;