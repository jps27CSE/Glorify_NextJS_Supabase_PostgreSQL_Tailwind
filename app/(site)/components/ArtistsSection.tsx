"use client";

import { Artist } from "@/types";
import ArtistCard from "@/components/ArtistCard";

interface ArtistsSectionProps {
  artists: Artist[];
}

const ArtistsSection: React.FC<ArtistsSectionProps> = ({ artists }) => {
  if (artists.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white text-2xl font-semibold">Artists</h1>
      </div>
      <div className="flex flex-wrap gap-6 justify-start">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.name}
            name={artist.name}
            imagePath={artist.image_path}
            localImagePath={artist.localImagePath}
            songCount={artist.songCount}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtistsSection;
