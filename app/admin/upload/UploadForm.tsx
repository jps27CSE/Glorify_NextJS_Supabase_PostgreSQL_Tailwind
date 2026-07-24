"use client";

import uniqid from "uniqid";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CompressionProgress from "@/components/CompressionProgress";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { FiUpload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { compressImage, compressAudio, CompressProgress } from "@/utils/compress";

const UploadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageProgress, setImageProgress] = useState<CompressProgress | null>(null);
  const [songProgress, setSongProgress] = useState<CompressProgress | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [compressedSong, setCompressedSong] = useState<File | null>(null);
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const { register, handleSubmit, reset, watch } = useForm<FieldValues>({
    defaultValues: {
      author: "",
      title: "",
      song: null,
      image: null,
    },
  });

  const songFile = watch("song")?.[0];
  const imageFile = watch("image")?.[0];

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
        message: "Image compression failed",
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
        message: "Audio compression failed",
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

      if (user.email !== "admin@glorify.com") {
        toast.error("Unauthorized");
        router.push("/");
        return;
      }

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
      setCompressedImage(null);
      setCompressedSong(null);
      setImageProgress(null);
      setSongProgress(null);
      reset();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const showImageProgress =
    imageProgress && imageProgress.stage !== "idle";
  const showSongProgress =
    songProgress && songProgress.stage !== "idle";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-x-3 mb-1">
          <FiUpload size={22} className="text-green-400" />
          <h1 className="text-2xl font-bold text-white">Upload Song</h1>
        </div>
        <p className="text-neutral-500 text-sm mt-1">
          Add a new worship song to the platform
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <form
          className="flex flex-col gap-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="text-sm text-neutral-400 block mb-2">
              Song Title
            </label>
            <Input
              id="title"
              disabled={isLoading}
              {...register("title", { required: true })}
              placeholder="Enter song title"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-2">
              Author / Artist
            </label>
            <Input
              id="author"
              disabled={isLoading}
              {...register("author", { required: true })}
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-2">
              Audio File (MP3)
            </label>
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-4 hover:border-neutral-500 transition">
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
              {!showSongProgress && (
                <p className="text-xs text-neutral-600 mt-2">
                  Maximum file size: 7 MB {">"} auto-compressed if larger
                </p>
              )}
            </div>
            {showSongProgress && (
              <div className="mt-3 bg-neutral-800 rounded-lg">
                <CompressionProgress
                  progress={songProgress}
                  label="Audio"
                />
              </div>
            )}
            {compressedSong &&
              songProgress?.stage !== "compressing" &&
              songProgress?.stage !== "reading" && (
                <div className="mt-2 flex items-center gap-x-2 text-xs">
                  {songProgress?.stage === "error" ? (
                    <span className="text-red-400 flex items-center gap-x-1">
                      <FiAlertCircle size={12} /> Compression failed, upload original
                    </span>
                  ) : (
                    <span className="text-green-400 flex items-center gap-x-1">
                      <FiCheckCircle size={12} />{" "}
                      {songFile?.size > 7 * 1024 * 1024
                        ? songProgress?.message || "Compressed"
                        : "Within limits"}
                    </span>
                  )}
                </div>
              )}
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-2">
              Thumbnail Image
            </label>
            <div className="border-2 border-dashed border-neutral-700 rounded-lg p-4 hover:border-neutral-500 transition">
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
              {!showImageProgress && (
                <p className="text-xs text-neutral-600 mt-2">
                  Maximum file size: 75 KB {">"} auto-compressed if larger
                </p>
              )}
            </div>
            {showImageProgress && (
              <div className="mt-3 bg-neutral-800 rounded-lg">
                <CompressionProgress
                  progress={imageProgress}
                  label="Thumbnail"
                />
              </div>
            )}
            {compressedImage &&
              imageProgress?.stage !== "compressing" &&
              imageProgress?.stage !== "reading" && (
                <div className="mt-2 flex items-center gap-x-2 text-xs">
                  {imageProgress?.stage === "error" ? (
                    <span className="text-red-400 flex items-center gap-x-1">
                      <FiAlertCircle size={12} /> Compression failed, upload original
                    </span>
                  ) : (
                    <span className="text-green-400 flex items-center gap-x-1">
                      <FiCheckCircle size={12} />{" "}
                      {imageFile?.size > 75 * 1024
                        ? imageProgress?.message || "Compressed"
                        : "Within limits"}
                    </span>
                  )}
                </div>
              )}
          </div>

          <Button
            disabled={
              isLoading ||
              showImageProgress ||
              showSongProgress
            }
            type="submit"
          >
            {isLoading ? "Uploading..." : "Upload Song"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;