"use client";

import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";
import LikeButton from "@/components/LikeButton";
import Slider from "@/components/Slider";
import usePlayer from "@/hooks/usePlayer";
import {
  BsPauseFill,
  BsPlayFill,
  BsRepeat,
  BsRepeat1,
} from "react-icons/bs";
import {
  AiFillStepBackward,
  AiFillStepForward,
  AiOutlineClose,
} from "react-icons/ai";
import { FaForward, FaBackward, FaRandom } from "react-icons/fa";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface NowPlayingViewProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  songDuration: number | null;
  progress: number;
  formatTime: (time: number) => string;
  handlePlay: () => void;
  handleSeekClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onSeek: (time: number) => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
}

const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  song,
  isOpen,
  onClose,
  isPlaying,
  currentTime,
  volume,
  songDuration,
  progress,
  formatTime,
  handlePlay,
  handleSeekClick,
  onSeek,
  onPlayNext,
  onPlayPrevious,
  onVolumeChange,
  onToggleMute,
}) => {
  const player = usePlayer();
  const [activeSong, setActiveSong] = useState(song);
  const [slideState, setSlideState] = useState<"idle" | "out" | "in">("idle");
  const imageUrl = useLoadImage(activeSong);

  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
  const totalDuration = formatTime((songDuration || 0) / 1000);

  const repeatIcons: Record<string, React.ReactNode> = {
    off: <BsRepeat size={20} />,
    all: <BsRepeat size={20} className="text-green-500" />,
    one: <BsRepeat1 size={20} className="text-green-500" />,
  };

  useEffect(() => {
    if (!isOpen) return;
    if (song.id === activeSong.id) return;

    setSlideState("out");

    const t1 = setTimeout(() => {
      setActiveSong(song);
      setSlideState("in");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideState("idle");
        });
      });
    }, 250);

    return () => clearTimeout(t1);
  }, [song.id, isOpen]);

  if (!isOpen) return null;

  const slideClass =
    slideState === "out"
      ? "opacity-0 -translate-x-20 scale-95"
      : slideState === "in"
        ? "opacity-0 translate-x-20 scale-95"
        : "opacity-100 translate-x-0 scale-100";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-xl animate-fade-in">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <AiOutlineClose size={22} />
        </button>
        <span className="text-sm text-neutral-400 font-medium tracking-wider uppercase">
          Now Playing
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full gap-y-6">
        <div
          className={`flex flex-col items-center gap-y-6 transition-all duration-300 ease-out ${slideClass}`}
        >
          <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-green-500/10">
            {imageUrl ? (
              <Image
                fill
                src={imageUrl}
                alt={activeSong.title}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 text-4xl">
                ♪
              </div>
            )}
          </div>

          <div className="text-center w-full">
            <h2 className="text-2xl font-bold text-white truncate">
              {activeSong.title}
            </h2>
            <p className="text-lg text-neutral-400 mt-1 truncate">
              {activeSong.author}
            </p>
          </div>

          <div className="flex items-center justify-center gap-x-4">
            <LikeButton songId={activeSong.id} />
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-2">
          <div
            className="relative w-full h-2.5 bg-neutral-800 rounded-full cursor-pointer group"
            onClick={handleSeekClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500 transition"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
              style={{ left: `calc(${progress}% - 10px)` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>{formatTime(currentTime)}</span>
            <span>{totalDuration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-x-5 md:gap-x-7">
          <button
            onClick={player.toggleShuffle}
            className={`transition ${
              player.isShuffle
                ? "text-green-500 hover:text-green-400"
                : "text-neutral-400 hover:text-white"
            }`}
            title={player.isShuffle ? "Disable Shuffle" : "Enable Shuffle"}
          >
            <FaRandom size={18} />
          </button>

          <button
            onClick={onPlayPrevious}
            className="text-neutral-400 hover:text-white transition"
            title="Previous"
          >
            <AiFillStepBackward size={26} />
          </button>

          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="text-neutral-400 hover:text-white transition"
            title="Rewind 5s"
          >
            <FaBackward size={16} />
          </button>

          <button
            onClick={handlePlay}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-white hover:scale-105 transition cursor-pointer"
          >
            {isPlaying ? (
              <BsPauseFill size={34} className="text-black" />
            ) : (
              <BsPlayFill size={34} className="text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={() =>
              onSeek(
                Math.min((songDuration || 0) / 1000, currentTime + 5)
              )
            }
            className="text-neutral-400 hover:text-white transition"
            title="Forward 5s"
          >
            <FaForward size={16} />
          </button>

          <button
            onClick={onPlayNext}
            className="text-neutral-400 hover:text-white transition"
            title="Next"
          >
            <AiFillStepForward size={26} />
          </button>

          <button
            onClick={player.cycleRepeat}
            className={`transition ${
              player.repeatMode !== "off"
                ? "text-green-500 hover:text-green-400"
                : "text-neutral-400 hover:text-white"
            }`}
            title={
              player.repeatMode === "one"
                ? "Repeat One"
                : player.repeatMode === "all"
                ? "Repeat All"
                : "Repeat Off"
            }
          >
            {repeatIcons[player.repeatMode]}
          </button>
        </div>

        <div className="flex items-center justify-center gap-x-3 w-full max-w-xs">
          <VolumeIcon
            onClick={onToggleMute}
            className="cursor-pointer text-neutral-400 hover:text-white transition flex-shrink-0"
            size={22}
          />
          <Slider value={volume} onChange={onVolumeChange} />
        </div>
      </div>
    </div>
  );
};

export default NowPlayingView;