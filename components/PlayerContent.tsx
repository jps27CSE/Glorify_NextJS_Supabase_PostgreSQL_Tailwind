"use client";

import { Song } from "@/types";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { useEffect, useRef, useState } from "react";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Slider from "@/components/Slider";
import usePlayer from "@/hooks/usePlayer";
import useSound from "use-sound";
import { FaForward } from "react-icons/fa";
import { FaBackward } from "react-icons/fa6";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const player = usePlayer();

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  };

  const [play, { pause, sound, duration: songDuration }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
    format: ["mp3"],
  });

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound && isPlaying) {
        setCurrentTime(sound.seek() as number);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sound, isPlaying]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (sound && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progress = clickX / rect.width;
      const newTime = progress * (songDuration! / 1000);
      sound.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progress = songDuration
    ? (currentTime / (songDuration / 1000)) * 100
    : 0;
  const totalDuration = formatTime((songDuration || 0) / 1000);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white
        p-1 cursor-pointer
        "
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-y-2">
        <div className="flex items-center gap-x-6">
          <AiFillStepBackward
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            size={30}
            onClick={onPlayPrevious}
          />

          <FaBackward
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            size={20}
            onClick={() => sound?.seek(Math.max(0, currentTime - 5))}
          />

          <div
            onClick={handlePlay}
            className="flex items-center justify-center h-10 w-10
         rounded-full bg-white p-1 cursor-pointer
        "
          >
            <Icon size={30} className="text-black" />
          </div>

          <FaForward
            className="text-neutral-400 cursor-pointer hover:text-white transition"
            size={20}
            onClick={() =>
              sound?.seek(Math.min((songDuration || 0) / 1000, currentTime + 5))
            }
          />

          <AiFillStepForward
            onClick={onPlayNext}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white
        transition
        "
          />
        </div>

        <div className="w-full flex items-center justify-between text-sm text-neutral-400 ">
          <span>{formatTime(currentTime)}</span>

          <div
            ref={progressBarRef}
            className="relative w-full h-2 bg-neutral-700 rounded-full cursor-pointer mx-4 "
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full hover:bg-blue-300 transition"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{totalDuration}</span>
        </div>
      </div>

      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={30}
          />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  );
};
export default PlayerContent;
