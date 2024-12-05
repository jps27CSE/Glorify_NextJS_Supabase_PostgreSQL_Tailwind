"use client";

import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";

interface SongItemProps {
  data: Song;
  onClick: (id: string) => void;
}

const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  return <div>SongItem</div>;
};
export default SongItem;
