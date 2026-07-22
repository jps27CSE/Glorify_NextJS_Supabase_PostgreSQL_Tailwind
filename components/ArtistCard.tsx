"use client";

import Image from "next/image";
import Link from "next/link";

interface ArtistCardProps {
  name: string;
  imagePath: string | null;
  songCount: number;
  localImagePath?: string | null;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ name, imagePath, songCount, localImagePath }) => {
  const src = localImagePath || "/images/liked.png";

  return (
    <Link
      href={`/artist/${encodeURIComponent(name)}`}
      className="flex flex-col items-center gap-y-2 group cursor-pointer"
    >
      <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden ring-2 ring-neutral-700 group-hover:ring-green-500 transition">
        <Image
          className="object-cover"
          src={src}
          fill
          alt={name}
        />
      </div>
      <p className="text-white font-semibold text-sm truncate w-32 md:w-36 lg:w-40 text-center">
        {name}
      </p>
      <p className="text-neutral-400 text-xs">{songCount} {songCount === 1 ? "song" : "songs"}</p>
    </Link>
  );
};

export default ArtistCard;
