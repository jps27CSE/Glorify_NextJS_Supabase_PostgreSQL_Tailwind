"use client";
import uniqid from "uniqid";
import Modal from "@/components/Modal";
import useUploadModal from "@/hooks/useUploadModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CompressionProgress from "@/components/CompressionProgress";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { compressImage, compressAudio, CompressProgress } from "@/utils/compress";

const UploadModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState<CompressProgress | null>(null);
  const [songProgress, setSongProgress] = useState<CompressProgress | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [compressedSong, setCompressedSong] = useState<File | null>(null);
  const uploadModal = useUploadModal();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
      uploadModal.onClose();
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
      setImageProgress({
        stage: "error",
        percent: 0,
        message: "Compression failed",
      });
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
      setSongProgress({
        stage: "error",
        percent: 0,
        message: "Compression failed",
      });
    }
  }, []);

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      const imageFile = compressedImage || values.image?.[0];
      const songFile = compressedSong || values.song?.[0];

      if (!imageFile || !songFile || !user) {
        toast.error("Missing Fields");
        return;
      }

      const uniqueID = uniqid();

      const { data: songData, error: songError } = await supabaseClient.storage
        .from("songs")
        .upload(`song-${values.title}-${uniqueID}`, songFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (songError) {
        setIsLoading(false);
        return toast.error("Failed song upload");
      }

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

      const { error: supabaseError } = await supabaseClient
        .from("songs")
        .insert({
          user_id: user.id,
          title: values.title,
          author: values.author,
          image_path: imageData.path,
          song_path: songData.path,
        });

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      toast.success("Song created!");
      reset();
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
      uploadModal.onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const showImageProgress =
    imageProgress && imageProgress.stage !== "idle" && imageProgress.stage !== "done";
  const showSongProgress =
    songProgress && songProgress.stage !== "idle" && songProgress.stage !== "done";

  return (
    <Modal
      title="Add a song"
      description="Upload an mp3 file"
      isOpen={uploadModal.isOpen}
      onChange={onChange}
    >
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
          <div className="pb-1">Select a song file</div>
          <Input
            id="song"
            type="file"
            disabled={isLoading}
            accept=".mp3"
            {...register("song", {
              required: true,
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
          <div className="pb-1">Select an image</div>
          <Input
            id="image"
            type="file"
            disabled={isLoading}
            accept="image/*"
            {...register("image", {
              required: true,
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
          {isLoading ? "Uploading..." : "Create"}
        </Button>
      </form>
    </Modal>
  );
};

export default UploadModal;