"use client";

import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CompressionProgress from "@/components/CompressionProgress";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Song } from "@/types";
import uniqid from "uniqid";
import { compressImage, compressAudio, CompressProgress } from "@/utils/compress";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, song }) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState<CompressProgress | null>(null);
  const [songProgress, setSongProgress] = useState<CompressProgress | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [compressedSong, setCompressedSong] = useState<File | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<FieldValues>({
    defaultValues: {
      title: "",
      author: "",
      song: null,
      image: null,
    },
  });

  useEffect(() => {
    if (song) {
      reset({
        title: song.title || "",
        author: song.author || "",
        song: null,
        image: null,
      });
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
    }
  }, [song, reset]);

  const onChange = (open: boolean) => {
    if (!open && !isLoading) {
      reset();
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
      onClose();
    }
  };

  const handleImageCompress = useCallback(async (file: File) => {
    if (file.size <= 75 * 1024) {
      setCompressedImage(file);
      return;
    }
    try {
      const compressed = await compressImage(file, setImageProgress);
      setCompressedImage(compressed);
    } catch {
      setImageProgress({ stage: "error", percent: 0, message: "Compression failed" });
    }
  }, []);

  const handleSongCompress = useCallback(async (file: File) => {
    if (file.size <= 7 * 1024 * 1024) {
      setCompressedSong(file);
      return;
    }
    try {
      const compressed = await compressAudio(file, setSongProgress);
      setCompressedSong(compressed);
    } catch {
      setSongProgress({ stage: "error", percent: 0, message: "Compression failed" });
    }
  }, []);

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    if (!song) return;

    try {
      setIsLoading(true);

      const rawImage = values.image?.[0];
      const rawSong = values.song?.[0];
      const imageFile = compressedImage || rawImage;
      const songFile = compressedSong || rawSong;

      let imagePath = song.image_path;
      let songPath = song.song_path;

      if (imageFile && rawImage) {
        const uniqueID = uniqid();
        const { data: imageData, error: imageError } =
          await supabaseClient.storage
            .from("images")
            .upload(`image-${values.title}-${uniqueID}`, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (imageError) {
          setIsLoading(false);
          return toast.error("Failed image upload");
        }

        if (song.image_path) {
          await supabaseClient.storage
            .from("images")
            .remove([song.image_path]);
        }

        imagePath = imageData.path;
      }

      if (songFile && rawSong) {
        const uniqueID = uniqid();
        const { data: songData, error: songError } =
          await supabaseClient.storage
            .from("songs")
            .upload(`song-${values.title}-${uniqueID}`, songFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (songError) {
          setIsLoading(false);
          return toast.error("Failed song upload");
        }

        if (song.song_path) {
          await supabaseClient.storage.from("songs").remove([song.song_path]);
        }

        songPath = songData.path;
      }

      const { error: supabaseError } = await supabaseClient
        .from("songs")
        .update({
          title: values.title,
          author: values.author,
          image_path: imagePath,
          song_path: songPath,
        })
        .eq("id", song.id);

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      toast.success("Song updated!");
      reset();
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const showImageProgress =
    imageProgress &&
    imageProgress.stage !== "idle" &&
    imageProgress.stage !== "done";
  const showSongProgress =
    songProgress &&
    songProgress.stage !== "idle" &&
    songProgress.stage !== "done";

  return (
    <Modal
      title="Edit Song"
      description="Update song details"
      isOpen={isOpen}
      onChange={onChange}
    >
      {song && (
        <form
          className="flex flex-col gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            id="title"
            disabled={isLoading}
            {...register("title", { required: true })}
            placeholder="Song Title"
          />
          <Input
            id="author"
            disabled={isLoading}
            {...register("author", { required: true })}
            placeholder="Song Author"
          />
          <div>
            <div className="pb-1 text-sm text-neutral-400">
              Replace song file (optional)
            </div>
            <Input
              id="song"
              type="file"
              disabled={isLoading}
              accept=".mp3"
              {...register("song", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCompressedSong(null);
                    setSongProgress(null);
                    if (file.size > 7 * 1024 * 1024) {
                      handleSongCompress(file);
                    } else {
                      setCompressedSong(file);
                    }
                  }
                },
              })}
            />
            {showSongProgress && (
              <div className="mt-2 bg-neutral-700/50 rounded-lg">
                <CompressionProgress progress={songProgress} label="Audio" />
              </div>
            )}
          </div>
          <div>
            <div className="pb-1 text-sm text-neutral-400">
              Replace thumbnail (optional)
            </div>
            <Input
              id="image"
              type="file"
              disabled={isLoading}
              accept="image/*"
              {...register("image", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCompressedImage(null);
                    setImageProgress(null);
                    if (file.size > 75 * 1024) {
                      handleImageCompress(file);
                    } else {
                      setCompressedImage(file);
                    }
                  }
                },
              })}
            />
            {showImageProgress && (
              <div className="mt-2 bg-neutral-700/50 rounded-lg">
                <CompressionProgress progress={imageProgress} label="Thumbnail" />
              </div>
            )}
          </div>
          <Button
            disabled={isLoading || showImageProgress || showSongProgress}
            type="submit"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      )}
    </Modal>
  );
};

export default EditModal;